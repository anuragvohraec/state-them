
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
    while(cNode && !(cNode === startCommentNode.endCommentNode)){
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


/**
 * SPECIAL MARKS
 */
const SM=new Set([".","@","?"]);

class STAttributeHandler{
    constructor(node){
        this.node=node;
        this.atReg={};
        this.planAttCount=-1;
    }

    getAttributeAtIndex(index){
        return this.atReg[index];
    }

    /**
     * this is used, as to get actual attribute count during re-render
     */
    getNumberOfPlaneAttribute(){
        if(this.planAttCount<0){
            this.planAttCount=0;
            Object.values(this.atReg).forEach(e=>{
                let s = e.name[0];
                if(!SM.has(s)){
                    this.planAttCount++;
                }
            });
        }
        return this.planAttCount;
    }

    getTotalAttributeCount(){
        return Object.keys(this.atReg).length;
    }

    handleAttributeChange(index, atName,newValue){
        const oldAtValue = this.atReg[index]?.value;
        //if old value is not equal to new value only than do he changes
        if(oldAtValue!==newValue){
            this.atReg[index]={name:atName,value: newValue};
            const propertyName = atName.substring(1);
            //if its a property change request
            if(atName.startsWith(".")){
                //set new value
                this.node[propertyName]=newValue;
                // and remove the old attribute
                this.node.removeAttribute(atName);
            }else if(atName.startsWith("@")){
                //get oldListener
                const oldListener = this.atReg[index]?.value;
                //if it exist then remove it from node
                if(oldListener){
                    this.node.removeEventListener(propertyName,oldListener);
                }
                //if newValue exist, then add it as event listener
                if(newValue){
                    this.node.addEventListener(propertyName,newValue);
                }
                // and remove the old attribute
                this.node.removeAttribute(atName);
            }else{

                //if new value is falsy and is marked optional
                if(!newValue && atName.startsWith("?")){
                    this.node.removeAttribute(atName);
                }else{
                    let effectiveName = atName;
                    //if its optional then effective name is propertyName
                    // and remove the old attribute
                    if(atName.startsWith("?")){
                        effectiveName=propertyName;
                        this.node.removeAttribute(atName);
                    }
                    //get its string representation and set it as attribute value
                    const s = newValue?newValue.toString():"";
                    this.node.setAttribute(effectiveName,s);
                }
            }   
        }
    }
}

function createStaticIteratorForApplicableNodes(targetNode){
    const l =[];
    let i = document.createNodeIterator(targetNode);
    let currentNode=targetNode;
    if(currentNode.nodeType===Node.COMMENT_NODE && currentNode.textContent===ASNT){
        l.push(currentNode)
    }else if(currentNode.nodeType===Node.ELEMENT_NODE){
        let caseOfReRender=false;
        if(currentNode.stAt){
            caseOfReRender=true;
        }

        if(!caseOfReRender){
            if(currentAttribute.value===ASNT){
                l.push(currentNode);
            }
        }else{
            l.push(currentNode);
        }
    }

    currentNode=i.nextNode();

    l.referenceNode=currentNode;
    l.nextNode = function (){
        this.referenceNode = this.unshift();
        return this.referenceNode;
    }
    return l;
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
    if(values.length==0){
        return;
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
                }else{
                    if(!(cv.templates || Array.isArray(cv))){
                        //if value are same move till next node
                        moveNodeIteratorTill(currentNode.endCommentNode,i);
                    }
                }
                
                index++;
            }else if(currentNode.nodeType===Node.ELEMENT_NODE){
                let attributeCount = currentNode.attributes.length;

                let caseOfReRender=false;
                if(currentNode.stAt){
                    caseOfReRender=true;
                    attributeCount=attributeCount+currentNode.stAt.getTotalAttributeCount()-currentNode.stAt.getNumberOfPlaneAttribute();
                }

                if(attributeCount>0){
                    for(let j=0;j<attributeCount;j++){
                        if(!caseOfReRender){
                            let currentAttribute = currentNode.attributes[j];
                        
                            if(currentAttribute.value===ASNT){
                                //first time render
                                if(!currentNode.stAt){
                                    currentNode.stAt=new STAttributeHandler(currentNode);
                                }
                                
                                currentNode.stAt.handleAttributeChange(index,currentAttribute.name,currentValues[index]);
                                
                                index++;
                            }   
                        }else if(caseOfReRender){

                            let currentAttribute = currentNode.stAt.getAttributeAtIndex(index);
                            currentNode.stAt.handleAttributeChange(index,currentAttribute.name,currentValues[index]);
                            
                            index++;
                        }
                    }
                }
               
            }
            let prevNode= currentNode;
            currentNode=i.nextNode();
            if(prevNode===currentNode){
                
            }
        }
    }

    targetNode.prevTemplates=templates;
}


export function repeat(items,idFunction,templateFunction){
    const result=[];
    items.forEach((item,index)=>{
        const _id = idFunction(item);
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