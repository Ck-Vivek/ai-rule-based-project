# DFS Algorithm Explanation for Project Defense

## 1. The Simple Summary (The Big Picture)

**What is it?**
We use an algorithm called **Depth-First Search (DFS)** to make our medical diagnoses. In rule-based expert systems, this method is known as **Backward Chaining**.

**How does it work?**
Instead of guessing randomly, the algorithm picks a disease rule (like a hypothesis) and goes "deep" down a checklist of its required symptoms. 
- If the user has the first symptom, it checks the next one. 
- If the user has *all* the symptoms on the path, the rule succeeds (Match!).
- If even *one* symptom is missing, it immediately stops and **backtracks** to try a different disease rule.

---

## 2. An Easy Example

Imagine the algorithm is checking if the patient has **Influenza**. 
The required checklist path is: `[Fever -> Cough -> Body Aches]`.

1. **Step 1:** It asks, "Does the user have a Fever?" 
   - If Yes: It goes one step *deeper*.
2. **Step 2:** It asks, "Does the user have a Cough?" 
   - If Yes: It goes one step *deeper*.
3. **Step 3:** It asks, "Does the user have Body Aches?"
   - If Yes: We reached the very bottom of the path! The algorithm returns `True`. Influenza is diagnosed!

*What if it fails?* 
If it checks Fever (Yes) but Cough (No), it doesn't bother checking for Body Aches. It immediately stops and moves on to check the next disease. This fast-stopping is called **backtracking**.

---

## 3. Simple Code Breakdown (For app.py)

If your teacher asks you to explain the Python code inside `app.py`, use these simple points:

```python
def dfs_match_rule(path_index: int, required_symptoms_list: List[str]) -> bool:
```
**Explanation:** This is our DFS function. We give it a list of symptoms to check, and it starts at the beginning (index 0).

```python
    if path_index >= len(required_symptoms_list):
        return True 
```
**Explanation (The Success Case):** If the index reaches the end of the list, it means we checked every single symptom and didn't fail once! We return `True` because the disease is a match.

```python
    current_symptom_node = required_symptoms_list[path_index]
```
**Explanation:** Here, we are simply looking at the *current* symptom we need to check on our list.

```python
    if current_symptom_node in symptom_set:
        return dfs_match_rule(path_index + 1, required_symptoms_list)
```
**Explanation (Going Deeper):** We check if the user actually has this symptom. If they DO, the algorithm calls itself to move `+ 1` step deeper into the list to check the next symptom. This is called **Recursive Traversal**.

```python
    else:
        return False
```
**Explanation (Failing Fast):** If the user does NOT have the required symptom, the rule is broken. We immediately return `False` and **backtrack** to try a different disease. 

---

**Pro Tip for Viva:** Make sure to use these keywords to impress the examiner: 
- **"Recursive"** (because the function calls itself to go deeper)
- **"Backtracking"** (because it stops and goes back when a symptom is missing)
- **"Backward Chaining"** (the official AI term for this kind of rule checking)
