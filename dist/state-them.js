const e=new Map,t="{{st}}";let i=1;function n(i,...n){const s=document.createElement("template");let o="",r=i.length;for(let e of i)r--,e.trim().endsWith("=")?o+=e+t:o+=0!==r?e+"\x3c!--{{st}}--\x3e \x3c!--{{st}}--\x3e":e;return s.innerHTML=o,e.has(i)||e.set(i,s),{_id:n,templates:i,values:n}}function s(){const e=new DocumentFragment,n=i++;let s=document.createComment(t);s.stid=n;let o=document.createComment(t);o.stid=n,s.endCommentNode=o,e.appendChild(s);let r=document.createTextNode("");return e.appendChild(r),e.appendChild(o),e.startCommentNode=s,e}function o(e,t){let i=e.nextSibling;const n=e.parentNode;for(;i&&i!==e.endCommentNode;){let e=i.nextSibling;n.removeChild(i),i=e}t||(t=document.createTextNode("")),n.insertBefore(t,e.endCommentNode)}function r(e,t){let i=t.referenceNode;for(;i!==e;)i=t.nextNode()}function h(n,a){const{templates:c,values:d,_id:m}=a;if(n.prevTemplates!==c){for(let e of n.childNodes)n.removeChild(e);const t=e.get(c).content.cloneNode(!0);n.appendChild(t)}{const e=d;let a=0,c=document.createNodeIterator(n),m=n;for(;m;){if(m.nodeType===Node.COMMENT_NODE&&m.textContent===t){let t=m._id,n=e[a];if(t!==n){let e;if(m._id=n,m.stid)e=m.stid;else{e=i++,m.stid=e;const t=m.nextSibling.nextSibling;t.stid=e,m.endCommentNode=t}if(n&&n.templates&&n.values){let e=!1;if(n._id?t?._id!==n._id&&(e=!0):e=!0,e){const e=new DocumentFragment;h(e,n),o(m,e),r(m.endCommentNode,c)}}else if(Array.isArray(n)){let e=!1;if(Array.isArray(t)||(t=[],e=!0),e||0===t.length||0===n.length){o(m);let e=new DocumentFragment;for(let t of n){let i=new DocumentFragment;h(i,t);let n=s();n.startCommentNode._id=t._id,o(n.startCommentNode,i),e.appendChild(n)}parent=m.parentNode,parent.insertBefore(e,m.endCommentNode),r(m.endCommentNode,c)}else{let e=m.endCommentNode;c.nextNode(),m=c.nextNode();let i=n.length-t.length,a=m.parentNode,d=0;for(;m!==e;){let t=m,l=t.endCommentNode;if(t._id!==n[d]._id){t._id=n[d]._id;let e=new DocumentFragment;h(e,n[d]),o(t,e)}if(r(l,c),m=c.nextNode(),d++,i<0&&d===n.length){for(;m!==e;)a.removeChild(m),m=c.nextNode();break}if(i>0&&m===e){for(;i>0;){let t=new DocumentFragment;h(t,n[d]);let r=s();r.startCommentNode._id=n[d]._id,o(r.startCommentNode,t),a.insertBefore(r,e),d++,i--}break}}}}else{o(m,new Text(n)),r(m.endCommentNode,c)}}else r(m.endCommentNode,c);a++}else if(m.nodeType===Node.ELEMENT_NODE){let i=!1,n=m.attributes.length;n>0&&(i=!0);let s=!1;if(m.stAt&&(s=!0,n=Object.keys(m.stAt).length),n>0)for(let o=0;o<n;o++)if(i&&!s){let i=m.attributes[o];if(i.value===t){m.stAt||(m.stAt={});let t=i._id,n=e[a];if(t!==n){if(i._id=e[a],i.name.startsWith(".")){m[i.name.substring(1)]=n,m.removeAttribute(i.name)}else if(i.name.startsWith("@")){const e=i.name.substring(1);t&&m.removeEventListener(e,t),m.addEventListener(e,n),m.removeAttribute(i.name)}else{let e="";n&&(e=n.toString());let t=i.name;if(t.startsWith("?"))if(e){m.removeAttribute(t);let i=t.substring(1);m.setAttribute(i,e)}else{m.removeAttribute(t);let e=t.substring(1);m.removeAttribute(e)}else i.value=e}m.stAt[a]=i}a++}}else if(s){let t=m.stAt[a],i=t._id,n=e[a];if(i!==n){t._id=n;const e=t.name;if(e.startsWith(".")){m[e.substring(1)]=n}else if(e.startsWith("@")){const t=e.substring(1);i&&m.removeEventListener(t,i),m.addEventListener(t,n)}else{let i="";if(n&&(i=n.toString()),e.startsWith("?"))if(i){let t=e.substring(1);m.setAttribute(t,i)}else{let t=e.substring(1);m.removeAttribute(t)}else t.value=i}}a++}}m=c.nextNode()}}n.prevTemplates=c}function a(e,t,i){const n=[];return e.forEach(((e,s)=>{const o=t(e),r=i(e,s,o);r._id=o,n.push(r)})),n}class c{#e;#t;#i={};#n=0;#s;#o={};#r;#h;static search(e,t){let i=t;for(;i;){if(i instanceof d){if(i.machineName===e&&i.machine)return i.machine;if(i.hasMachine(e))return i.getHostedMachine(e)}let t=i.parentNode;t instanceof ShadowRoot&&(t=t.host),i=t}}get name(){return this.#h}constructor({model:e,initState:t,integrateWith:i={}}){if(e)if(this.#e=e,t)this.#t=t;else{let t=Object.keys(e);t.length>0&&(this.#t=t[0])}this.#s=i}get state(){return this.#t}_subscribe(e){let t=++this.#n;return this.#i[t]=e,t}_unsubscribe(e){delete this.#i[e]}onConnection(e,t){if(this.#h=t,this.#r=e,Object.keys(this.#s).length>0)for(let e in this.#s){const t=c.search(e,this.#r);if(!t)throw`${JSON.stringify({ec:1,im:e,he:this.#r.tagName,m:this.#h})}`;const i=i=>{const n=this.#s[e][i];if(n){const e=n[this.#t];e&&this.do(e,t)}};this.#o[e]={machine:t,subscription_id:t._subscribe(i)}}}onDisconnection(){for(let e in this.#o)try{let{machine:t,subscription_id:i}=this.#o[e];t._unsubscribe(i)}catch(e){console.error(e)}}do(e,t){let i=this.#e?.[this.#t]?.[e];if(void 0===i)throw`${JSON.stringify({ec:2,an:e,he:this.#r.tagName,m:this.#h})}`;this?.[e]?.(t),this.#t=i;for(let e in this.#i)try{this.#i[e](i)}catch(e){console.error(e)}}}class d extends HTMLElement{#h;#a;#c;#d;#m;constructor({machineName:e,hostedMachines:t={}}){super(),this.#h=e,this.#a=t,this.hasAttribute("shadow")?(this.attachShadow({mode:"open"}),this.#c=this.shadowRoot):this.#c=this}get machineName(){return this.#h}hasMachine(e){return!!this.#a&&!!this.#a[e]}getHostedMachine(e){return this.#a?.[e]}get machine(){return this.#d}connectedCallback(){for(let e in this.#a)try{this.#a[e].onConnection(this.#c,e)}catch(e){console.error(e)}if(this.#h){if(this.#d=c.search(this.#h,this),!this.#d)throw`${JSON.stringify({ec:4,he:this.tagName,m:this.#h})}`;try{this.#m=this.#d._subscribe((e=>{this.rebuild(e)}))}catch(e){console.error(e)}}this.rebuild(this.#d?.state)}disconnectedCallback(){this.#d&&this.#d._unsubscribe(this.#m);for(let e in this.#a)try{this.#a[e].onDisconnection()}catch(e){console.error(e)}}rebuild(e){if(!this.build)throw`${JSON.stringify({ec:5,w:this.tagName})}`;h(this.#c,this.build(e,this.#d))}}export{c as StateMachine,d as StateMachineWidget,n as html,h as render,a as repeat};
