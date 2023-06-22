const templateCache = new Map();

const ASNT="{{st}}";
const ESNT="{{ste}}";
const TSNT=`<!--${ASNT}--> <!--${ESNT}-->`;

/**
 * Create HTM templates and store them in cache
 * @param {*} templates 
 * @param  {...any} values 
 * @returns 
 */
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

function createStaticIterationList(targetNode){
    const result=[];
    const itr = document.createNodeIterator(targetNode);
    const currentNode = targetNode;
    while(!currentNode){
        if(currentNode.nodeType===Node.COMMENT_NODE && currentNode.textContent===ASNT){
            //this means it do not have been render even once: fresh node
            if(!currentNode.endCommentNode){
                currentNode.endCommentNode=currentNode.nextSibling.nextSibling;
            }
            if(currentNode.isArray){
                //move till 
                let cn = itr.nextNode();
                while(cn!==currentNode.endCommentNode){
                    cn = itr.nextNode();
                }
            }
            result.push(currentNode);
        }else if(currentNode.nodeType===Node.ELEMENT_NODE){
            if(currentNode.stAt){
                result.push(currentNode);
            }else{
                for(let i=0;i<currentNode.attributes.length;i++){
                    let currentAttribute = currentNode.attributes[j];
                    if(currentAttribute.value===ASNT){
                        result.push(currentNode);
                        break;
                    } 
                }
            }
        }
        currentNode=itr.nextNode();
    }
    return result;
}

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


function createEmptyFragment(){
    const df = new DocumentFragment();
    
    let startCommentNode = document.createComment(ASNT);
    let endCommentNode = document.createComment(ESNT);

    startCommentNode.endCommentNode=endCommentNode;

    df.appendChild(startCommentNode);
    
    let emptyTextNode = document.createTextNode("");
    df.appendChild(emptyTextNode);
    
    df.appendChild(endCommentNode);
    df.startCommentNode=startCommentNode;
    return df;
}


export function render(target,templateResult){
    const {templates,values}=templateResult;

    //if templates have changed then clean up the target node
    if(targetNode.prevTemplates!==templates){
        targetNode.prevTemplates=templates;
        for(let c of targetNode.childNodes){
            targetNode.removeChild(c);
        }

        const tNode = templateCache.get(templates);
        const node = tNode.content.cloneNode(true);
        targetNode.appendChild(node);
    }

    {
        const applicableNodes = createStaticIterationList(target);
        let index=0;
        for(let currentNode of applicableNodes){
            if(currentNode.nodeType === Node.COMMENT_NODE){
                //case of comments nodes
                const pv = currentNode.value;
                const cv = values[index];

                if(pv!==cv){
                    currentNode.value=cv;

                    if(cv && cv.templates && cv.values){
                        if(cv.templates !== pv?.templates || cv.values!==pv?.values){
                            const tn = new DocumentFragment();
                            render(tn,cv);

                            replaceInBetweenCommentNode(currentNode,tn);
                        }
                    }else if(Array.isArray(cv)){
                        currentNode.isArray=true;
                        const startCommentNode=currentNode;
                        const endCommentNode=startCommentNode.endCommentNode;
                        if(!pv){
                            pv=[];
                        }
                        
                        /*
                         Concept:
                         <!--{{st}}-->//startCommentNode
                            //array elements
                            <!--{{st}}-->
                                //render for the value
                            <!--{{ste}}-->
                         <!--{{ste}}-->//endCommentNode

                        old is an array of {_id,templates,values,startCommentNode}
                        old and new array are compared
                        if(old and new id do not match){
                            if(old do not have an entry): then a new is created and added
                            else : old is completely rendered
                        }
                         */

                        let k=0;
                        for(let nTR of cv){
                            let oTR = pv[k];
                            //nTR and oTR are of type : {_id,templates,values,startCommentNode}
                            
                            if(nTR._id!==oTR?._id){
                            //if id mismatch than needs a render
    
                                if(!oTR){
                                //if there is no oldTemplateResult : create new one
                                    let d = new DocumentFragment();
                                    render(d,nTR);

                                    const ef = createEmptyFragment();
                                    replaceInBetweenCommentNode(ef.startCommentNode,d);

                                    startCommentNode.parentNode.insertBefore(ef,endCommentNode);

                                    //set a reference to this newly created nodes start comment node in nTR
                                    nTR.startCommentNode=ef.startCommentNode;
                                }else{
                                //else if oldTemplateResult exist: update its content with new render
                                    let d = new DocumentFragment();
                                    render(d,nTR);

                                    replaceInBetweenCommentNode(oTR.startCommentNode,d);
                                    //set a reference to old start comment node in nTR
                                    nTR.startCommentNode=oTR.startCommentNode;
                                }
                            }
                            k++;
                        }

                        //if k is less than the length of previous values
                        //this nodes are no more required and hence will be removed
                        if(k<pv.length-1){
                            let cn = pv[k].startCommentNode;
                            while(cn!==endCommentNode){
                                let nn = cn.nextSibling;
                                //remove all nodes till you see end comment node
                                parent.removeChild(cn);
                                cn=nn;
                            }
                        }
                    }else{
                        const tn = new Text(cv);
                        replaceInBetweenCommentNode(currentNode,tn); 
                    }
                }
                index++;
            }else{
                
                if(!currentNode.stAt){
                    currentNode.stAt={};
                    
                    //case of nodes with attributes
                    const t =[];
                    for(let a of currentNode.attributes){
                        if(currentAttribute.value===ASNT){
                            currentNode.stAt[currentAttribute.name]=null;
                            t.push(a.name);
                        }
                    }
                    for(let a of t){
                        currentNode.removeAttribute(a);
                    }  
                }

                for(let a in currentNode.stAt){
                    let pv = currentNode.stAt[a];
                    let cv = values[index];

                    if(pv!==cv || !cv){
                        const propertyName = atName.substring(1);
                        //cv can be falsy
                        if(a.startsWith(".")){
                            currentNode[propertyName]=cv;
                        }else if(a.startsWith("@")){
                            if(pv){
                                currentNode.removeEventListener(propertyName,pv);
                            }
                            if(cv){
                                currentNode.addEventListener(propertyName,pv);
                            }
                        }else if(a.startsWith("?")){
                            if(cv){
                                const s =cv?cv.toString():"";
                                currentNode.setAttribute(propertyName,s);
                            }
                        }else{
                            const s =cv?cv.toString():"";
                            currentNode.setAttribute(propertyName,s);
                        }
                    }

                    index++;
                }

            }
        }
    }
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