/**
 *
 */
class Pact
{
    constructor()
    {
        console.warn('You dont need an instace of Pact; use the static methods or extend Pact.Component');
    }

    static render (node)
    {
        const $el = document.createElement(node.tagName);

        for (const [k, v] of Object.entries(node.attrs)) {
            if (k.startsWith('on')) {
                let key = k.replace('on', '').toLowerCase();
                $el.addEventListener(key, v);
            } else {
                $el.setAttribute(k, v);
            }
        }

        if (node.textContent !== false) {
            let $textNode = document.createTextNode(node.textContent);
            $el.appendChild($textNode);
        }

        for (const child of node.children) {
            if (child instanceof Pact.Component) {
                child.setParent($el);
                $el.appendChild(child.getTag());
            } else {
                $el.appendChild(Pact.render(child));
            }
        }

        for (const [e, ev] of Object.entries(node.events)) {
            $el.addEventListener(e, ev);
        }

        return $el;
    }

    static diff (newTag, oldTag)
    {
        const conditions = {
            tag: oldTag.tagName === newTag.tagName,
            css: oldTag.style.cssText === newTag.style.cssText,
            txt: oldTag.innerText === newTag.innerText
        };

        for (let key in conditions) {
            if (!conditions.hasOwnProperty(key)) continue;

            if (conditions[key] === false) {
                return false;
            }
        }


        return true;
    }

    static patch (newTag, oldTag)
    {
        const conditions = {
            tagName: oldTag.tagName === newTag.tagName,
            'style.cssText': oldTag.style.cssText === newTag.style.cssText,
            value: oldTag.value === newTag.value
        };

        for (let key in conditions) {
            if (!conditions.hasOwnProperty(key)) continue;

            if (conditions[key] === false) {
                let o = _.get(oldTag, key);
                let n = _.get(newTag, key);

                _.set(oldTag, key, _.get(newTag, key));
            }
        }

        if (newTag.hasChildNodes() && oldTag.hasChildNodes()) {

            _.zip([... newTag.children], [... oldTag.children]).map(([newChild, oldChild]) => {
                const childConditions = {
                    'style.cssText': oldChild.style.cssText === newChild.style.cssText,
                    innerText: oldChild.innerText === newChild.innerText,
                };

                for (let k in childConditions) {
                    if (!childConditions.hasOwnProperty(k)) continue;

                    if (childConditions[k] === false) {
                        _.set(oldChild, k, _.get(newChild, k));
                    }
                }
            });
        }
    }

    static createElement (tagName, textContent = false, attrs = {}, children = [])
    {
        if (typeof textContent == 'object' && _.isEmpty(attrs)) {
            attrs = textContent;
            textContent = false;
        }

        return {
            tagName,
            textContent,
            attrs,
            children,
            events: {}
        };
    }

    static h (... args)
    {
        return Pact.createElement.apply(null, args)
    }

    static on (eventName, tag, callback)
    {
        tag.events = tag.events || {};
        tag.events[eventName] = callback;

        return tag;
    }

    static get Component ()
    {
        return class {
            constructor ()
            {
                this.el = false;
                this.db = false;

                this.state = {};

                this.componentDidCreate();
            }

            render ()
            {
                return Pact.h('h1', 'HelloWorld');
            }

            getRender ()
            {
                let re = this.render();

                let rxp = /{([^}]+)}/g,
                    str = re.textContent,
                    curMatch;

                // I'm not fond of the regex approach but haven't got a better way yet.

                while (curMatch = rxp.exec(str)) {
                    re.textContent = re.textContent.replace(curMatch[0], _.get(this, curMatch[1], ''));
                }

                if (re.children.length > 0) {
                    re.children.map(child => {
                        let match = rxp.exec(child.textContent);

                        if (match) {
                            child.textContent = child.textContent.replace(match[0], _.get(this, match[1], ''));
                        }

                        return child;
                    })
                }

                return re;
            }

            getTag ()
            {
                let re = this.getRender();

                return Pact.render(re);
            }

            setParent(el)
            {
                this.el = el;
            }

            mount (target)
            {
                this.el = this.el ? this.el : document.querySelector(target);

                let tag = this.getTag();

                if (this.el.hasChildNodes()) {
                    this.el.replaceChild(tag, this.el.firstChild);
                } else {
                    this.el.appendChild(tag);
                    this.componentDidMount();
                }
            }

            setState (state)
            {
                if (!_.isEqual(this.state, _.assign({}, this.state, state))) {
                    if (this.db) console.log('<!> state changed');
                    this.state = _.assign({}, this.state, state);
                    this.onChange();
                }
            }

            onChange ()
            {
                if (this.db) console.log('<*> stateChange');

                this.update();
            }

            update ()
            {
                if (this.db) console.log('<*> update');

                if (!this.el) {
                    if (this.db) console.error('<!> component isnt mounted yet');
                    return 0;
                }

                let newTag = this.getTag();

                if (this.el.hasChildNodes()) {
                    if (Pact.diff(newTag, this.el.firstChild)) {
                        this.el.replaceChild(newTag, this.el.firstChild);
                    } else {
                        Pact.patch(newTag, this.el.firstChild);
                    }
                } else {
                    this.el.appendChild(newTag);
                }
            }

            componentDidCreate ()
            {
            }

            componentDidMount ()
            {
            }

            static mount (target)
            {
                let instance = new this;
                    instance.mount(target);

                return instance;
            }
        }
    }
}
