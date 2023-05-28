1. DONE: If the build function returns a new template then what needs to be done
```
build(state){
    if(a) return html`1`;
    else return html`2`
}
```
    * clear previous values and rerender

2. DONE: nesting template inside each other
html`${a?html`1`:html`2`}`

3. DONE: Repeat items efficiently

4. DONE: Add attributes only if defined, with ?attributes