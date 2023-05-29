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
