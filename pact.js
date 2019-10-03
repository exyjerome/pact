class Pact {
    constructor()
    {
        console.warn('You dont need an instace of Pact; use the static methods or extend Pact.Component');
    }
    static render (node) {
        const $el = document.createElement(node.tagName);

        for (const [k, v] of Object.entries(node.attrs)) {
            $el.setAttribute(k, v);
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

    static diff (newTag, oldTag) {
        const conditions = {
            tag: oldTag.tagName === newTag.tagName,
            css: oldTag.style.cssText === newTag.style.cssText,
            txt: oldTag.textContent === newTag.textContent
        };

        for (let key in conditions) {
            if (!conditions.hasOwnProperty(key)) continue;

            if (conditions[key] === false) {
                return false;
            }
        }

        return true;
    }

    static patch (newTag, oldTag) {
        const conditions = {
            tagName: oldTag.tagName === newTag.tagName,
            'style.cssText': oldTag.style.cssText === newTag.style.cssText,
            textContent: oldTag.textContent === newTag.textContent
        };

        for (let key in conditions) {
            if (!conditions.hasOwnProperty(key)) continue;

            if (conditions[key] === false) {
                _.set(oldTag, key, _.get(newTag, key));
            }
        }
    }

    static createElement (tagName, textContent = false, attrs = {}, children = []) {
        return {
            tagName,
            textContent,
            attrs,
            children,
            events: {}
        };
    }

    static h (... args) {
        return Pact.createElement.apply(null, args)
    }

    static on (eventName, tag, callback) {
        tag.events = tag.events || {};
        tag.events[eventName] = callback;

        return tag;
    }
}

Pact.Component = class {
    constructor () {
        this.ee = new EventEmitter;
        this.el = false;
        this.db = false;

        this.state = {};

        this.ee.on('stateChange', this.onChange.bind(this));
        this.ee.on('componentDidMount', this.componentDidMount.bind(this));
        this.ee.on('componentDidCreate', this.componentDidCreate.bind(this));

        this.ee.emit('componentDidCreate');
    }

    render ()
    {
        return Pact.h('h1', 'HelloWorld');
    }

    getRender()
    {
        let re = this.render();

        let rxp = /{([^}]+)}/g,
            str = re.textContent,
            curMatch;

        while (curMatch = rxp.exec(str)) {
            re.textContent = re.textContent.replace(curMatch[0], _.get(this, curMatch[1], ''));
        }

        return re;
    }

    getTag()
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

        let re = this.getRender();

        if (this.el.hasChildNodes()) {
            console.log('replace child node with me');
        } else {
            this.el.appendChild(Pact.render(re));
            this.ee.emit('componentDidMount');
        }
    }

    setState (state)
    {
        if (!_.isEqual(this.state, _.assign({}, this.state, state))) {
            if (this.db) console.log('<!> state changed');
            this.state = _.assign({}, this.state, state);
            this.ee.emit('stateChange');
        }
    }

    onChange()
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

        let re = this.getRender();

        let newTag = Pact.render(re);

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

    componentDidCreate()
    {
    }

    componentDidMount()
    {
    }
}
