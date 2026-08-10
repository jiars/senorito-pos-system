import { supabase } from './src/supabaseClient.js';
async function test() {
  const {data: e, error: err1} = await supabase.from('expenses').select('*').limit(1);
  const {data: ec, error: err2} = await supabase.from('expense_categories').select('*').limit(1);
  const {data: w, error: err3} = await supabase.from('wastage').select('*').limit(1);
  
  if (err1) console.error("Expenses Error:", err1);
  else console.log("Expenses Cols:", e.length ? Object.keys(e[0]) : "Empty Table");
  
  if (err2) console.error("Expense Categories Error:", err2);
  else console.log("Expense Categories Cols:", ec.length ? Object.keys(ec[0]) : "Empty Table");

  if (err3) console.error("Wastage Error:", err3);
  else console.log("Wastage Cols:", w.length ? Object.keys(w[0]) : "Empty Table");
}
test();
