import { supabase } from '../supabaseClient';
import { supabaseAdmin } from '../supabaseAdmin';
import { logSystemActivity } from '../authService';

export const fetchRoles = async () => {
  try {
    const response = await supabase.from('roles').select('*');
    if (response.error !== null) throw response.error;
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error.message);
    throw error;
  }
};

export const fetchEmployees = async () => {
  try {
    const response = await supabase
      .from('profiles')
      .select('*, role:roles(role_name)')
      .order('created_at', { ascending: false });
    
    if (response.error !== null) throw response.error;
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    throw error;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    // 1. Fetch the role_id for the given role_name (e.g. 'Cashier')
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('role_name', employeeData.roleName)
      .single();

    if (roleError) throw new Error("Invalid role selected");
    const roleId = roleData.id;

    // 2. Create the user using Supabase Admin Auth (so it doesn't log the owner out)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: employeeData.email,
      password: employeeData.password,
      email_confirm: true // auto confirm
    });

    if (authError) throw authError;

    const newUserId = authData.user.id;

    // 3. Insert or update the profile (depending on if a trigger created an empty one automatically)
    // Sometimes databases have a trigger to create a profile automatically on auth.users insert.
    // We use upsert to be safe, updating the existing one or inserting a new one.
    const profilePayload = {
      id: newUserId,
      first_name: employeeData.firstName,
      last_name: employeeData.lastName,
      username: employeeData.username,
      email: employeeData.email,
      contact_number: employeeData.contactNumber,
      role_id: roleId,
      status: 'Active'
    };

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert([profilePayload]);

    if (profileError) {
      // ROLLBACK: Delete the created auth user if profile insertion fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      console.error("Profile Error, Rolled back user:", profileError);
      throw profileError;
    }

    await logSystemActivity();
    return { success: true, userId: newUserId };
  } catch (error) {
    console.error('Error creating employee:', error.message);
    throw error;
  }
};

export const updateEmployee = async (userId, employeeData) => {
  try {
    // 1. If a new password is provided, update it via Admin API
    if (employeeData.password && employeeData.password.trim() !== "") {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: employeeData.password }
      );
      if (authError) throw authError;
    }

    // 2. Fetch the role_id for the given role_name
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('role_name', employeeData.roleName)
      .single();

    if (roleError) throw new Error("Invalid role selected");
    const roleId = roleData.id;

    // 3. Update the profile
    const profilePayload = {
      first_name: employeeData.firstName,
      last_name: employeeData.lastName,
      contact_number: employeeData.contactNumber,
      role_id: roleId,
      status: employeeData.status
    };

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profilePayload)
      .eq('id', userId);

    if (profileError) throw profileError;

    // Step 3: Hard Ban Enforcement
    if (employeeData.status === 'Deactivated') {
      await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '87600h' });
    } else {
      await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
    }

    await logSystemActivity();
    return { success: true };
  } catch (error) {
    console.error('Error updating employee:', error.message);
    throw error;
  }
};
