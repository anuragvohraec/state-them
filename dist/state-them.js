const e=new Map,t="{{st}}",i="{{ste}}",s=`\x3c!--${t}--\x3e \x3c!--${i}--\x3e`;function n(i,...n){const o=document.createElement("template");let h="",a=i.length;for(let e of i)a--,e.trim().endsWith("=")?h+=e+t:h+=0!==a?e+s:e;return o.innerHTML=h,e.has(i)||e.set(i,o),{_id:n,templates:i,values:n}}function o(e,t){let i=e.nextSibling;const s=e.parentNode;for(;i&&i!==e.endCommentNode;){let e=i.nextSibling;s.removeChild(i),i=e}t||(t=document.createTextNode("")),s.insertBefore(t,e.endCommentNode)}function h(){const e=new DocumentFragment;let s=document.createComment(t),n=document.createComment(i);s.endCommentNode=n,e.appendChild(s);let o=document.createTextNode("");return e.appendChild(o),e.appendChild(n),e.startCommentNode=s,e}function a(i,s){const{templates:n,values:r}=s;if(i.prevTemplates!==n){i.prevTemplates=n;for(let e of i.childNodes)i.removeChild(e);const t=e.get(n).content.cloneNode(!0);i.appendChild(t)}{const e=function(e){const i=[],s=document.createNodeIterator(e);let n=e;for(;n;){if(n.nodeType===Node.COMMENT_NODE&&n.textContent===t){if(n.endCommentNode||(n.endCommentNode=n.nextSibling.nextSibling),n.isArray){let e=s.nextNode();for(;e!==n.endCommentNode;)e=s.nextNode()}i.push(n)}else if(n.nodeType===Node.ELEMENT_NODE)if(n.stAt)i.push(n);else for(let e=0;e<n.attributes.length;e++)if(n.attributes[e].value===t){i.push(n);break}n=s.nextNode()}return i}(i);let s=0;for(let i of e)if(i.nodeType===Node.COMMENT_NODE){const e=i.value,t=r[s];if(e!==t)if(i.value=t,t&&t.templates&&t.values){if(t.templates!==e?.templates||t.values!==e?.values){const e=new DocumentFragment;a(e,t),o(i,e)}}else if(Array.isArray(t)){i.isArray=!0;const s=i,n=s.endCommentNode;e||(e=[]);let r=0;for(let i of t){let t=e[r];if(i._id!==t?._id)if(t){let e=new DocumentFragment;a(e,i),o(t.startCommentNode,e),i.startCommentNode=t.startCommentNode}else{let e=new DocumentFragment;a(e,i);const t=h();o(t.startCommentNode,e),s.parentNode.insertBefore(t,n),i.startCommentNode=t.startCommentNode}r++}if(r<e.length-1){let t=e[r].startCommentNode;for(;t!==n;){let e=t.nextSibling;parent.removeChild(t),t=e}}}else{o(i,new Text(t))}s++}else{if(!i.stAt){i.stAt={};const e=[];for(let s of i.attributes)s.value===t&&(i.stAt[s.name]=null,e.push(s.name));for(let t of e)i.removeAttribute(t)}for(let e in i.stAt){let t=i.stAt[e],n=r[s];if(t!==n||!n){i.stAt[e]=n;const s=e.substring(1);if(e.startsWith("."))i[s]=n;else if(e.startsWith("@"))t&&i.removeEventListener(s,t),n&&i.addEventListener(s,t);else if(e.startsWith("?")){if(n){const e=n?n.toString():"";i.setAttribute(s,e)}}else{const e=n?n.toString():"";i.setAttribute(s,e)}}s++}}}}function r(e,t,i){const s=[];return e.forEach(((e,n)=>{const o=t(e),h=i(e,n,o);h._id=o,s.push(h)})),s}class c{#e;#t;#i={};#s=0;#n;#o={};#h;#a;static search(e,t){let i=t;for(;i;){if(i instanceof m){if(i.machineName===e&&i.machine)return i.machine;if(i.hasMachine(e))return i.getHostedMachine(e)}let t=i.parentNode;t instanceof ShadowRoot&&(t=t.host),i=t}}get name(){return this.#a}constructor({model:e,initState:t,integrateWith:i={}}){if(e)if(this.#e=e,t)this.#t=t;else{let t=Object.keys(e);t.length>0&&(this.#t=t[0])}this.#n=i}get state(){return this.#t}_subscribe(e){let t=++this.#s;return this.#i[t]=e,t}_unsubscribe(e){delete this.#i[e]}onConnection(e,t){if(this.#a=t,this.#h=e,Object.keys(this.#n).length>0)for(let e in this.#n){const t=c.search(e,this.#h);if(!t)throw`${JSON.stringify({ec:1,im:e,he:this.#h.tagName,m:this.#a})}`;const i=i=>{const s=this.#n[e][i];if(s){const e=s[this.#t];e&&this.do(e,t)}};this.#o[e]={machine:t,subscription_id:t._subscribe(i)}}}onDisconnection(){for(let e in this.#o)try{let{machine:t,subscription_id:i}=this.#o[e];t._unsubscribe(i)}catch(e){console.error(e)}}do(e,t){let i=this.#e?.[this.#t]?.[e];if(void 0===i)throw`${JSON.stringify({ec:2,an:e,he:this.#h.tagName,m:this.#a})}`;this?.[e]?.(t),this.#t=i;for(let e in this.#i)try{this.#i[e](i)}catch(e){console.error(e)}}}class m extends HTMLElement{#a;#r;#c;#m;#l;constructor({machineName:e,hostedMachines:t={}}){super(),this.#a=e,this.#r=t,this.hasAttribute("shadow")?(this.attachShadow({mode:"open"}),this.#c=this.shadowRoot):this.#c=this}get machineName(){return this.#a}hasMachine(e){return!!this.#r&&!!this.#r[e]}getHostedMachine(e){return this.#r?.[e]}get machine(){return this.#m}connectedCallback(){for(let e in this.#r)try{this.#r[e].onConnection(this.#c,e)}catch(e){console.error(e)}if(this.#a){if(this.#m=c.search(this.#a,this),!this.#m)throw`${JSON.stringify({ec:4,he:this.tagName,m:this.#a})}`;try{this.#l=this.#m._subscribe((e=>{this.rebuild(e)}))}catch(e){console.error(e)}}this.rebuild(this.#m?.state)}disconnectedCallback(){this.#m&&this.#m._unsubscribe(this.#l);for(let e in this.#r)try{this.#r[e].onDisconnection()}catch(e){console.error(e)}}rebuild(e){if(!this.build)throw`${JSON.stringify({ec:5,w:this.tagName})}`;let t=this.build(e,this.#m);t||(t=n``),a(this.#c,t)}}export{c as StateMachine,m as StateMachineWidget,n as html,a as render,r as repeat};
