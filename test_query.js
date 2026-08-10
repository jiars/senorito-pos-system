import { supabase } from './src/supabaseClient.js';
async function test() {
  const {data: i} = await supabase.from('inventory_items').select('*').limit(1);
  const {data: b} = await supabase.from('inventory_batches').select('*').limit(1);
  const {data: p} = await supabase.from('inventory_purchase_history').select('*').limit(1);
  const {data: a} = await supabase.from('inventory_audit_logs').select('*').limit(1);
  const {data: c} = await supabase.from('inventory_categories').select('*').limit(1);
  const {data: u} = await supabase.from('profiles').select('*').limit(1);
  console.log("Items:", Object.keys(i[0] || {}));
  console.log("Batches:", Object.keys(b[0] || {}));
  console.log("Purchases:", Object.keys(p[0] || {}));
  console.log("Audit:", Object.keys(a[0] || {}));
  console.log("Categories:", Object.keys(c[0] || {}));
  console.log("Profiles:", Object.keys(u[0] || {}));
}
test();
