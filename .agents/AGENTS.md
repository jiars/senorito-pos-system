# Workspace Coding Guidelines: "College Student" / Beginner-Friendly Style

1. **Strictly No Shortcuts**: Avoid ES6+ advanced syntax shortcuts (e.g., complex nested destructuring like `{ data: { session } }`, complicated ternary operators, optional chaining `?.` where simple if statements work better, or implicit arrow function returns without brackets). Write code out explicitly step-by-step.
2. **Simple, Straightforward Logic**: Avoid over-engineered defensive programming or excessive error/null checking for impossible edge cases if it clutters the code. Use simple, readable checks (e.g., `if (profile)` instead of `if (profile !== null && profile.first_name !== undefined && ...)`).
3. **Readability Over Brevity**: It is completely okay for code to be longer if it makes the flow easier to understand and debug. Prioritize clarity, descriptive variable names, and sequential step-by-step execution.
4. **No AI-Robotic Bloat**: Keep the code natural, clean, and simple, as if a CS college student or junior developer wrote it cleanly for a project.
5. **No Whole-File Dumps in Chat**: Never send complete code files in chat responses. Only provide the exact lines, snippets, or diffs that need to be added, changed, or removed to save tokens and make changes easy to trace.
6. **Separation of Concerns (Utils & Helpers)**: Always place data formatters, string manipulators, date helpers, and reusable calculation functions inside the `src/utils/` directory as separate `.js` files. Keep React components clean and focused purely on rendering UI.
