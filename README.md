# state-them
Reactive UI framework for front-end JS.
It has:
1. Template engine: For creating HTML nodes
```js
let a =5;
let template = html`<div some=${a+1} .prop1=${"hello"} @click=${()=>console.log("do_something")}>${a}</div>`;
render(template,document.body);
```
2. `StateMachine` for creating state and `StateMachineWidget` to react to those states
```js
class Counter extends StateMachine{
    constructor(){
        super({
            model:{
                "init":{
                    "increment":"init",
                    "decrement":"init"
                }
            }
        });
        this.count=0;
    }

    increment(){
        this.count++;
    }
    decrement(){
        this.count++;
    }
}

class CounterWidget extends StateMachineWidget{
    constructor(){
        super({
            machineName:"Counter1",
            hostedMachines:{
                Counter1:new Counter()
            }
        });
    }

    build(state){
        return html`<div>
        <div>
            <button @click=${e=>this.machine.do("increment")}>+</button><button @click=${e=>this.machine.do("decrement")}>-</button>
        </div>
        <div>
            ${this.machine.count}
        </div>
        </div>`;
    }
}
custom.defineElement("counter-wid",CounterWidget);
```

Via Model you can define possible states of machines and which action on a state will convert to which state on the machine.
You can integrate this machine with even other machines. See `main.html` file for complete example of what all it can do.

# Usage notes
1. A `StateMachineWidget` automatically searches the state machine it depends upon in the DOM tree. The State machine must be either hosted to itself using `hostedMachines` property
    of input config, else it searches it in its parent node , and its parent node until to document.

2. To change state of a StateMachine `do` method is called along with a action name and an optional data if required: `do(actionName,data)`.
3. A `StateMachine` can be integrated with states from other machines,so that when there states changes the state on this machine can be changed. `integrateWith` property of config for `StateMachine` constructor is used to do this integration.
    ```js
        integrateWith:{
            Incrementor1:{
                "changed":{
                    "init":"changeIncrement"
                }
            }
        }
    ```
    Here a StateMachine is integrated with another StateMachine with name `Incrementor1`. Whenever the state of `Incrementor1` changes to `changed`, and 
    the listener machine is in `init` state than its`do("changeIncrement",Incrementor1StateMachineInstance)` will be called.

4. Use `repeat` function to create efficiently updating a list of items.
```
let items=[10,20,30];
html`<ol>
${repeat(items,i=>i,(item,index,_id)=>{
    return html`<li>${item}</li>`;
})}
</ol>`
```
This will produce a HTML of kind
```
<ol>
    <li>10</li>
    <li>20</li>
    <li>30</li>
</ol>
```
The signature for `repeat` function is `repeat(listOfItems,idFunction,templateFunction)`.
    * `listOfItems` which needs to be repeated upon
    * `idFunction` needs to create a unique id for each element. If Id of an element changes, than only it get re-rendered
    * `templateFunction` is used to create the template which needs to repeated for the list of items.

It will auto update only those items which gets updated, if `idFunction` is properly designed to cater to change id if data item changes.

5. Attribute can be modified using
```js
html`<div customAtt=${some_varibable}></div>`
```

6. Add event listeners
```js
html`<div @event=${some_handler}></div>`
```

7. Add properties
```js
html`<div .prop=${some_value}></div>`
```

# Error Codes
Different error codes are used , to make final built as small as possible.

1. 1 : Integrated Machine with which this machine is integrated is not found in DOM tree.
```
{
    ec:1,//error code
    im:"m1",//machines with with its integrated,
    m:"name"// name of this machine
    he: "host-element"//element on which this machine is hosted
}
```

2. 2: No such action found, while calling do method on a machine.
```
{
    ec:2,//error code
    am:"action_name",
    m:"name"// name of this machine
    he: "host-element"//element on which this machine is hosted
}
```

3. 3: DEPRECATED : If an action do not exist the state will simply transform as per model.
For action to take place, one must define a function on state machine with the action name. This error code indicates that no such method is found on the state machine.
```
{
    ec:3,
    an: "action_name",
    m:"name"// name of this machine
    he: "host-element"//element on which this machine is hosted
}
```

4. 4: A `StateMachineWidget` depends upon a `StateMachine`, however it cannot find it upon connection in the DOM tree.
```
{
    ec:4,
    m:"name"// name of this machine
    he: "host-element"//element on which this machine is hosted
}
```

5. 5: No build function found on the `StateMachineWidget`. 
```
{ec: 5, w:"widget-name"}
```

# Release Note

## 1.0.3
1. Bug fixed: While create static list of applicable nodes, one muts not go down the custom elements and inside its children.

## 1.0.2
1. Bug fixes
2. Separated template engine into template-them.js, contains function `html`,`repeat`,`render`.

## 1.0.1
1. Error codes, to make footprint of final built small.