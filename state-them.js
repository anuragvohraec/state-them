
import {html,repeat,render} from './template-them.js';

export {html,repeat,render};

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////


export class StateMachine{

    #model;
    #state;
    #listeners={};
    #id=0;
    #integrateWith;
    #foundMachines={};
    #hostElement;
    #machineName;

    static search(machineName, startingElement){
        let currentEl = startingElement;
        while(currentEl){
            if(currentEl instanceof StateMachineWidget){
                if(currentEl.machineName === machineName && currentEl.machine){
                    return currentEl.machine;
                }else if(currentEl.hasMachine(machineName)){
                    return currentEl.getHostedMachine(machineName);
                }
            }
            let t= currentEl.parentNode;
            if(t instanceof ShadowRoot){
                t = t.host;
            }
            currentEl = t;
        }
    }

    get name(){
        return this.#machineName;
    }

    /**
     * 
     * @param {string} initState: the initial state for this
     * @param {any} model:
     * 
     */
    constructor({model=undefined, initState=undefined,integrateWith={}}){
        if(model){
            this.#model=model;
            if(initState){
                this.#state=initState;
            }else{
                let k = Object.keys(model);
                if(k.length>0){
                    this.#state=k[0];
                }
            }
        }
        this.#integrateWith=integrateWith;
    }

    get state(){
        return this.#state;
    }

    _subscribe(newStateHandler){
        let id = ++this.#id;
        this.#listeners[id]=newStateHandler;
        return id;
    }

    _unsubscribe(subscription_id){
        delete this.#listeners[subscription_id];
    }

    onConnection(hostElement, machineName){
        this.#machineName=machineName;
        this.#hostElement=hostElement;
        if(Object.keys(this.#integrateWith).length>0){
            for(let smName in this.#integrateWith){
                const sm = StateMachine.search(smName,this.#hostElement);
                if(!sm){
                    throw `${JSON.stringify({ec:1, im: smName, he: this.#hostElement.tagName, m: this.#machineName})}`;
                }

                const newStateHandler =(newState)=>{
                    const s = this.#integrateWith[smName][newState];
                    if(s){
                        const a = s[this.#state];
                        if(a){
                            this.do(a,sm);
                        }
                    }
                };

                this.#foundMachines[smName]={
                    machine: sm,
                    subscription_id: sm._subscribe(newStateHandler)
                };
            }
        }
    }

    onDisconnection(){
        for(let smName in this.#foundMachines){
            try{
                let {machine, subscription_id}=this.#foundMachines[smName];
                machine._unsubscribe(subscription_id);
            }catch(e){
                console.error(e);
            }
        }
    }

    /**
     * If return true than state is changed
     */
    do(actionName,data){
        let nextState = this.#model?.[this.#state]?.[actionName];
        if(nextState===undefined){
            throw `${JSON.stringify({ec:2, an: actionName, he: this.#hostElement.tagName, m: this.#machineName})}`;
        }

        //actions to execute before state change
        this?.[actionName]?.(data);

        //new state
        this.#state = nextState;

        //publish new state to all listeners
        for(let id in this.#listeners){
            try{
                this.#listeners[id](nextState);
            }catch(e){
                console.error(e);
            }
        }

        // if(this[actionName]){
        //     if(!this[actionName](data)){
        //         //new state
        //         this.#state = nextState;

        //         //publish new state to all listeners
        //         for(let id in this.#listeners){
        //             try{
        //                 this.#listeners[id](nextState);
        //             }catch(e){
        //                 console.error(e);
        //             }
        //         }
        //     }
        // }else{
        //     throw `${JSON.stringify({ec:3, an: actionName, he: this.#hostElement.tagName, m: this.#machineName})}`;
        // }
    }


}

export class StateMachineWidget extends HTMLElement{
    #machineName;
    #hostedMachines;
    #root;
    #machine;
    #subscription_id;

    constructor({
        machineName,
        hostedMachines={},
    }){
        super();
        this.#machineName=machineName;
        this.#hostedMachines=hostedMachines;

        if(this.hasAttribute("shadow")){
            this.attachShadow({mode: "open"});
            this.#root=this.shadowRoot;
        }else{
            this.#root=this;
        }
        
    }

    get machineName(){
        return this.#machineName;
    }

    hasMachine(machineName){
        if(!this.#hostedMachines){
            return false;
        }else{
            if(this.#hostedMachines[machineName]){
                return true;
            }else{
                return false;
            }
        }
    }

    getHostedMachine(machineName){
        return this.#hostedMachines?.[machineName];
    }

    get machine(){
        return this.#machine;
    }

    connectedCallback(){
        for(let smName in this.#hostedMachines){
            try{
                this.#hostedMachines[smName].onConnection(this.#root,smName);
            }catch(e){
                console.error(e);
            }
        }

        if(this.#machineName){
            this.#machine=StateMachine.search(this.#machineName,this);
            if(!this.#machine){
                throw `${JSON.stringify({ec:4, he: this.tagName, m: this.#machineName})}`;
            }
            try{
                this.#subscription_id=this.#machine._subscribe((newState)=>{
                    this.rebuild(newState);
                });
            }catch(e){
                console.error(e);
            }
        }

        this.rebuild(this.#machine?.state);
    }

    disconnectedCallback(){
        if(this.#machine){
            this.#machine._unsubscribe(this.#subscription_id);
        }

        for(let smName in this.#hostedMachines){
            try{
                this.#hostedMachines[smName].onDisconnection();
            }catch(e){
                console.error(e);
            }
        }
    }

    rebuild(newState){
        if(!this.build){
            throw `${JSON.stringify({ec:5, w:this.tagName})}`;
        }
        let t = this.build(newState,this.#machine);
        if(!t){
            t=html``;
        }
        render(this.#root,t);
    }

}