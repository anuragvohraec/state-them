const e=new Map,t="{{st}}",n="{{ste}}",i=`\x3c!--${t}--\x3e \x3c!--${n}--\x3e`;function s(n,...s){const o=document.createElement("template");let h="",r=n.length;for(let e of n)r--,e.trim().endsWith("=")?h+=e+t:h+=0!==r?e+i:e;return o.innerHTML=h,e.has(n)||e.set(n,o),{_id:s,templates:n,values:s}}function o(e){const n=document.createNodeIterator(e.parentNode);let i=n.referenceNode;for(;i!==e;)i=n.nextNode();i=n.nextNode();const s=[];for(;i&&i!==e.endCommentNode;){if(i.nodeType===Node.COMMENT_NODE&&i.textContent===t){if(i.endCommentNode||(i.endCommentNode=i.nextSibling.nextSibling),i.isSpecial){let e=n.nextNode();for(;e!==i.endCommentNode;)e=n.nextNode()}s.push(i)}else if(i.nodeType===Node.ELEMENT_NODE)if(i.stAt)s.push(i);else for(let e=0;e<i.attributes.length;e++){if(i.attributes[e].value===t){s.push(i);break}}i=n.nextNode()}return s}function h(e,t){let n=e.nextSibling;const i=e.parentNode;for(;n&&n!==e.endCommentNode;){let e=n.nextSibling;i.removeChild(n),n=e}t||(t=document.createTextNode("")),i.insertBefore(t,e.endCommentNode)}function r(){const e=new DocumentFragment;let i=document.createComment(t),s=document.createComment(n);i.endCommentNode=s,e.appendChild(i);let o=document.createTextNode("");return e.appendChild(o),e.appendChild(s),e.startCommentNode=i,e}function a(n,i){const{templates:s,values:o}=i;if(n.prevTemplates!==s){n.prevTemplates=s;for(let e of n.childNodes)n.removeChild(e);const t=e.get(s).content.cloneNode(!0);n.appendChild(t)}c(function(e){const n=[],i=document.createNodeIterator(e);let s=i.nextNode();for(;s;){if(s.nodeType===Node.COMMENT_NODE&&s.textContent===t){if(s.endCommentNode||(s.endCommentNode=s.nextSibling.nextSibling),s.isSpecial){let e=i.nextNode();for(;e!==s.endCommentNode;)e=i.nextNode()}n.push(s)}else if(s.nodeType===Node.ELEMENT_NODE)if(s.stAt)n.push(s);else for(let e=0;e<s.attributes.length;e++)if(s.attributes[e].value===t){n.push(s);break}s=i.nextNode()}return n}(n),o)}function c(e,n){let i=0;for(let s of e)if(s.nodeType===Node.COMMENT_NODE){const e=s.value,t=n[i];if(e!==t)if(s.value=t,t&&t.templates&&t.values){if(s.isSpecial=!0,t.templates!==e?.templates){const e=new DocumentFragment;a(e,t),h(s,e)}else if(t.values!==e?.values){c(o(s),t.values)}}else if(Array.isArray(t)){s.isSpecial=!0;const n=s,i=n.endCommentNode;let o=e;o||(o=[]);let c=0;for(let e of t){let t=o[c];if(e._id!==t?._id)if(t){let n=new DocumentFragment;a(n,e),h(t.startCommentNode,n),e.startCommentNode=t.startCommentNode}else{let t=new DocumentFragment;a(t,e);const s=r();h(s.startCommentNode,t),n.parentNode.insertBefore(s,i),e.startCommentNode=s.startCommentNode}else e.startCommentNode=t.startCommentNode;c++}if(c<o.length-1){let e=o[c].startCommentNode;for(;e!==i;){let t=e.nextSibling;n.parentNode.removeChild(e),e=t}}}else{h(s,new Text(t))}i++}else{if(!s.stAt){s.stAt={};const e=[];for(let n of s.attributes)n.value===t&&(s.stAt[n.name]=null,e.push(n.name));for(let t of e)s.removeAttribute(t)}for(let e in s.stAt){let t=s.stAt[e],o=n[i];if(t!==o){s.stAt[e]=o;const n=e.substring(1);if(e.startsWith("."))s[n]=o;else if(e.startsWith("@"))t&&s.removeEventListener(n,t),o&&s.addEventListener(n,o);else if(e.startsWith("?")){if(o){const e=o?o.toString():"";s.setAttribute(n,e)}}else{const t=o?o.toString():"";s.setAttribute(e,t)}}i++}}}function m(e,t,n){const i=[];return e.forEach(((e,s)=>{const o=t(e),h=n(e,s,o);h._id=o,i.push(h)})),i}class d{#e;#t;#n={};#i=0;#s;#o={};#h;#r;static search(e,t){let n=t;for(;n;){if(n instanceof l){if(n.machineName===e&&n.machine)return n.machine;if(n.hasMachine(e))return n.getHostedMachine(e)}let t=n.parentNode;t instanceof ShadowRoot&&(t=t.host),n=t}}get name(){return this.#r}constructor({model:e,initState:t,integrateWith:n={}}){if(e)if(this.#e=e,t)this.#t=t;else{let t=Object.keys(e);t.length>0&&(this.#t=t[0])}this.#s=n}get state(){return this.#t}_subscribe(e){let t=++this.#i;return this.#n[t]=e,t}_unsubscribe(e){delete this.#n[e]}onConnection(e,t){if(this.#r=t,this.#h=e,Object.keys(this.#s).length>0)for(let e in this.#s){const t=d.search(e,this.#h);if(!t)throw`${JSON.stringify({ec:1,im:e,he:this.#h.tagName,m:this.#r})}`;const n=n=>{const i=this.#s[e][n];if(i){const e=i[this.#t];e&&this.do(e,t)}};this.#o[e]={machine:t,subscription_id:t._subscribe(n)}}}onDisconnection(){for(let e in this.#o)try{let{machine:t,subscription_id:n}=this.#o[e];t._unsubscribe(n)}catch(e){console.error(e)}}do(e,t){let n=this.#e?.[this.#t]?.[e];if(void 0===n)throw`${JSON.stringify({ec:2,an:e,he:this.#h.tagName,m:this.#r})}`;this?.[e]?.(t),this.#t=n;for(let e in this.#n)try{this.#n[e](n)}catch(e){console.error(e)}}}class l extends HTMLElement{#r;#a;#c;#m;#d;constructor({machineName:e,hostedMachines:t={}}){super(),this.#r=e,this.#a=t,this.hasAttribute("shadow")?(this.attachShadow({mode:"open"}),this.#c=this.shadowRoot):this.#c=this}get machineName(){return this.#r}hasMachine(e){return!!this.#a&&!!this.#a[e]}getHostedMachine(e){return this.#a?.[e]}get machine(){return this.#m}connectedCallback(){for(let e in this.#a)try{this.#a[e].onConnection(this.#c,e)}catch(e){console.error(e)}if(this.#r){if(this.#m=d.search(this.#r,this),!this.#m)throw`${JSON.stringify({ec:4,he:this.tagName,m:this.#r})}`;try{this.#d=this.#m._subscribe((e=>{this.rebuild(e)}))}catch(e){console.error(e)}}this.rebuild(this.#m?.state)}disconnectedCallback(){this.#m&&this.#m._unsubscribe(this.#d);for(let e in this.#a)try{this.#a[e].onDisconnection()}catch(e){console.error(e)}}rebuild(e){if(!this.build)throw`${JSON.stringify({ec:5,w:this.tagName})}`;let t=this.build(e,this.#m);t||(t=s``),a(this.#c,t)}}export{d as StateMachine,l as StateMachineWidget,s as html,a as render,m as repeat};
