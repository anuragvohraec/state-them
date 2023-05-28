
const cache = new Map();

/**
 * ATT_SENTINEL
 */
const ASNT="{{st}}";
/**
 * TEXT_SENTINEL
 */
const TSNT="<!--{{st}}--> <!--{{st}}-->";
let count=1;

export function html(templates,...values){
    
    const t = document.createElement("template");
    let s = "";
    let n =templates.length;

    for(let t of templates){
        n--;
        if(t.trim().endsWith("=")){
            s+=(t+ASNT);
        }else{
            if(n!==0){
                s+=(t+TSNT);
            }else{
                s+=t;
            }
        }
    }
    t.innerHTML=s;//templates.join(TEXT_SENTINEL);
    if(!cache.has(templates)){
        cache.set(templates,t);
    }
    return {
        _id:values,
        templates,
        values  
    };
}

function createEmptyFragment(){
    const df = new DocumentFragment();
    const stid = count++;
    let startCommentNode = document.createComment(ASNT);
    startCommentNode.stid=stid;
    let endCommentNode = document.createComment(ASNT);
    endCommentNode.stid=stid;

    startCommentNode.endCommentNode=endCommentNode;

    df.appendChild(startCommentNode);
    
    let emptyTextNode = document.createTextNode("");
    df.appendChild(emptyTextNode);
    
    df.appendChild(endCommentNode);
    df.startCommentNode=startCommentNode;
    return df;
}

/**
 * 
 * @param {CommentNode} startCommentNode 
 * @param {Node} nodeToInsert
 */
function replaceInBetweenCommentNode(startCommentNode,nodeToInsert){
    let cNode=startCommentNode.nextSibling;
    const parent = startCommentNode.parentNode;
    while(!(cNode === startCommentNode.endCommentNode)){
        let nNode = cNode.nextSibling
        parent.removeChild(cNode);
        cNode=nNode;
    }
    if(!nodeToInsert){
        nodeToInsert=document.createTextNode("");
    }
    parent.insertBefore(nodeToInsert,startCommentNode.endCommentNode);
}

function moveNodeIteratorTill(tillNode, iterator){
    let cNode = iterator.referenceNode;
    while(cNode!==tillNode){
        cNode = iterator.nextNode();
    }
}


export function render(targetNode,templateResult){
    const {templates,values,_id}=templateResult;
  
    //if template has changed, then clean up the target node
    if(targetNode.prevTemplates!==templates){
        for(let c of targetNode.childNodes){
            targetNode.removeChild(c);
        }
        const tNode = cache.get(templates);
        const node = tNode.content.cloneNode(true);
        targetNode.appendChild(node);
    }

    //does the diffing process and change only those node which got changed
    {
        const currentValues=values;
        let index = 0;
        let i = document.createNodeIterator(targetNode);
        let currentNode=targetNode;
        while(currentNode){
            if(currentNode.nodeType===Node.COMMENT_NODE && currentNode.textContent===ASNT){
                let pv= currentNode._id;
                let cv = currentValues[index];
                //check if value at this index has changed between previous and now
                //then we need to modify this node
                if(pv!==cv){
                    currentNode._id=cv;

                    //stid id is used so that html`` template strings can nest one inside another
                    let stid;
                    if(!currentNode.stid){
                        //first time render
                        stid=count++;
                        currentNode.stid=stid;
                        const endCommentNode = currentNode.nextSibling.nextSibling;
                        endCommentNode.stid=stid;
                        currentNode.endCommentNode=endCommentNode;
                    }else{
                        stid=currentNode.stid;
                    }
                    
                    //case of template result: that is current value is a TemplateResult : html`something`
                    if(cv && cv.templates && cv.values){
                        let doRender=false;
                        if(cv._id){
                            if(pv?._id!==cv._id){
                                doRender=true;
                            }
                        }else{
                            doRender=true;
                        }

                        if(doRender){
                            const tn = new DocumentFragment();
                            render(tn,cv);
                            //remove the nodes in between
                            replaceInBetweenCommentNode(currentNode,tn);
                            moveNodeIteratorTill(currentNode.endCommentNode,i);
                        }
                    }else if(Array.isArray(cv)){
                        let isFirstTime=false;
                        if(!Array.isArray(pv)){
                            pv=[];
                            isFirstTime=true;
                        }

                        if(isFirstTime || pv.length === 0 || cv.length === 0){
                            replaceInBetweenCommentNode(currentNode);
                            let df = new DocumentFragment();
                            for(let v of cv){
                                let actualRender=new DocumentFragment();
                                render(actualRender,v);
                                let wf = createEmptyFragment();
                                wf.startCommentNode._id=v._id;
                                replaceInBetweenCommentNode(wf.startCommentNode,actualRender);
                                df.appendChild(wf);
                            }
                            parent=currentNode.parentNode;
                            parent.insertBefore(df,currentNode.endCommentNode);
                            moveNodeIteratorTill(currentNode.endCommentNode,i);
                        }else{
                            let startCommentNode = currentNode;
                            let endCommentNode = startCommentNode.endCommentNode;

                            
                            i.nextNode();//text
                            currentNode=i.nextNode();//comment node of iteration
                            
                            let status = cv.length-pv.length;
                            
                            let parent = currentNode.parentNode;
                            
                            let j=0;
                            while(currentNode!==endCommentNode){
                                let scn = currentNode;
                                let ecn = scn.endCommentNode;
                                if(scn._id!==cv[j]._id){
                                    scn._id=cv[j]._id;
                                    //rerender in 
                                    let actualRender=new DocumentFragment();
                                    render(actualRender,cv[j]);
                                    replaceInBetweenCommentNode(scn,actualRender);
                                }
                                moveNodeIteratorTill(ecn,i);
                                currentNode=i.nextNode();
                                j++;


                                if(status<0 && j===cv.length){
                                    //remove all extra nodes after words
                                    while(currentNode!==endCommentNode){
                                        parent.removeChild(currentNode);
                                        currentNode=i.nextNode();;
                                    }
                                    break;
                                }
                                if(status>0 && currentNode === endCommentNode){
                                    //there are more current values than the one present
                                    //create new node and insert them before the endCommentNode
                                    while(status>0){
                                        let actualRender=new DocumentFragment();
                                        render(actualRender,cv[j]);
                                        let wf = createEmptyFragment();
                                        wf.startCommentNode._id=cv[j]._id;
                                        replaceInBetweenCommentNode(wf.startCommentNode,actualRender);
                                        parent.insertBefore(wf,endCommentNode);
                                        j++;
                                        status--;
                                    }
                                    break;
                                }
                            }
                            
                        }
                        
                    }else{
                       //new text node which will replace the node
                        const tn = new Text(cv);
                        replaceInBetweenCommentNode(currentNode,tn);
                        moveNodeIteratorTill(currentNode.endCommentNode,i);
                        
                    }
                }
                index++;
            }else if(currentNode.nodeType===Node.ELEMENT_NODE){
                let hasAttributes=false;
                let attributeCount = currentNode.attributes.length;
                if(attributeCount>0){
                    hasAttributes=true;
                }

                let caseOfReRender=false;
                if(currentNode.stAt){
                    caseOfReRender=true;
                    attributeCount=Object.keys(currentNode.stAt).length;
                }

                if(attributeCount>0){
                    for(let j=0;j<attributeCount;j++){
                        if(hasAttributes && !caseOfReRender){
                            let currentAttribute = currentNode.attributes[j];
                        
                            if(currentAttribute.value===ASNT){
                                //first time render
                                if(!currentNode.stAt){
                                    currentNode.stAt={};
                                }
                                
                                let pv = currentAttribute._id;
                                let currentValue=currentValues[index];

                                if(pv!==currentValue){
                                    currentAttribute._id = currentValues[index];

                                    //if attribute starts with . then its property set
                                    if(currentAttribute.name.startsWith(".")){
                                        const propertyName = currentAttribute.name.substring(1);
                                        currentNode[propertyName]=currentValue;
                                        currentNode.removeAttribute(currentAttribute.name);
                                    }
                                    
                                    else if(currentAttribute.name.startsWith("@")){
                                        const eventName = currentAttribute.name.substring(1);
                                        //remove previous listeners
                                        if(pv){
                                            currentNode.removeEventListener(eventName,pv);
                                        }
                                        currentNode.addEventListener(eventName,currentValue);
                                        currentNode.removeAttribute(currentAttribute.name);
                                    }
                                    
                                    else{
                                        let s = "";
                                        if(currentValue){
                                            s=currentValue.toString();
                                        }
                                        let attributeName = currentAttribute.name;
                                        if(attributeName.startsWith("?")){
                                            if(s){
                                                currentNode.removeAttribute(attributeName);
                                                let t1=attributeName.substring(1);
                                                currentNode.setAttribute(t1,s);
                                            }else{
                                                currentNode.removeAttribute(attributeName);
                                                let t1=attributeName.substring(1);
                                                currentNode.removeAttribute(t1);
                                            }
                                        }else{
                                            currentAttribute.value=s;
                                        }
                                        
                                    }

                                    currentNode.stAt[index]=currentAttribute;
                                }
                                index++;
                            }   
                        }else if(caseOfReRender){

                            let currentAttribute = currentNode.stAt[index];
                            let pv = currentAttribute._id;
                            let currentValue=currentValues[index];

                            if(pv!==currentValue){
                                currentAttribute._id= currentValue;
                                const attributeName = currentAttribute.name;

                                //if attribute starts with . then its property set
                                if(attributeName.startsWith(".")){
                                    const propertyName = attributeName.substring(1);
                                    currentNode[propertyName]=currentValue;
                                }else if(attributeName.startsWith("@")){
                                    const eventName = attributeName.substring(1);
                                    //remove previous listeners
                                    if(pv){
                                        currentNode.removeEventListener(eventName,pv);
                                    }
                                    currentNode.addEventListener(eventName,currentValue);
                                }else{
                                    let s = "";
                                    if(currentValue){
                                        s=currentValue.toString();
                                    }
                                    if(attributeName.startsWith("?")){
                                        if(s){
                                            let t1=attributeName.substring(1);
                                            currentNode.setAttribute(t1,s);
                                        }else{
                                            let t1=attributeName.substring(1);
                                            currentNode.removeAttribute(t1);
                                        }
                                    }else{
                                        currentAttribute.value=s;
                                    }
                                }

                            }
                            index++;
                        }
                    }
                }
               
            }

            currentNode=i.nextNode();
        }
    }

    targetNode.prevTemplates=templates;
}


export function repeat(items,idFunction,templateFunction){
    const result=[];
    items.forEach((item,index)=>{
        const _id = idFunction(item);
        //rebuild is probably required
        const templateResult=templateFunction(item,index,_id);
        templateResult._id=_id;
        result.push(templateResult);
    });
    return result;
}




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

    #name;
    #model;
    #state;
    #listeners={};
    #id=0;
    #reactsTo;
    #foundMachines={};
    #hostElement;

    static searchMachineFrom(machineName, startingElement){
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

    /**
     * 
     * @param {string} name : name of this state machine, used for subscription
     * @param {string} initState: the initial state for this
     * @param {any} model:
     * 
     */
    constructor({name, model=undefined, initState=undefined,reactsTo=[]}){
        this.#name=name;
        if(model){
            this.#model=model;
            this.#state=initState;
        }
        this.#reactsTo=reactsTo;
    }


    searchMachine(machineName){
        return StateMachine.searchMachineFrom(machineName,this.#hostElement);
    }

    get name(){
        return this.#name;
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


    reactToStateChangeFrom(stateMachine){

    }

    onConnection(hostElement){
        this.#hostElement=hostElement;
        if(this.#reactsTo.length>0){
            for(let smName of this.#reactsTo){
                const sm = this.searchMachine(smName);
                if(!sm){
                    throw `[STATE-THEM]: Required state machine not found: [${smName}] , Required by: ${JSON.stringify({host:this.#hostElement.tagName, machine: this.#name})}`;
                }

                const newStateHandler =(newState)=>{
                    this.reactToStateChangeFrom(sm);
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
    do(actionName){
        let nextState = this.#model?.[this.#state]?.[actionName];
        if(this[actionName]){
            if(!this[actionName]()){
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
            }
        }else{
            throw `[STATE-THEM]: No such action: ${JSON.stringify({action:actionName, host:this.#hostElement.tagName, machine: this.#name})}`;
        }
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
                this.#hostedMachines[smName].onConnection(this.#root);
            }catch(e){
                console.error(e);
            }
        }

        if(this.#machineName){
            this.#machine=StateMachine.searchMachineFrom(this.#machineName,this);
            if(!this.#machine){
                throw `[STATE-THEM]: Required state machine not found: [${this.#machineName}] , Required by: ${JSON.stringify({host:this.tagName})}`;
            }
            try{
                this.#subscription_id=this.#machine._subscribe((newState)=>{
                    this.rebuild(newState);
                });
                this.rebuild(this.#machine.state);
            }catch(e){
                console.error(e);
            }
        }
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
            throw `[STATE-THEM]: No build function found for ${this.tagName}`;
        }
        render(this.#root,this.build(newState));
    }

}