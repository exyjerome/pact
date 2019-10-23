# Pact

### A rather small Component library

I've been using React/Vue for a little while now and decided to make my own mini version to understand the inner workings

Requires Lodash, ~~EventEmitter~~

~~Although EventEmitter could definitely be removed, it's a bit redundant. I can just do `this.componentDidUpdate()` etc.~~

Lodash could be removed, but `_.get` and `_.set` are useful. While `_.assign(...)` could be replaced with `Object.assign(...)`

It's worth mentioning this could be super horrible and may not implement best practices!

Using a virtual DOM to render components
Children currently work~~, but only static children, I need to re-work `Pact.diff` & `Pact.patch`~~

Children currently work to a degree, for the most part if `state.foo` changes in a child, it will update the child's textContent

If state has been updated but is the same, we won't redraw or rerender the DOM, only if an actual change has happened

I'm considering if `state: {key: 1}` changes to `state: {key: '1'}` adding a warning in console, letting them know
it changed from an `Int` to a `String`

--

I need to update patch/diff, then when comparing a tag, run patch/diff on the children and patch changes, the way it does it now _works_ kinda but isn't very pretty

### Navbar example

```js
class Navbar extends Pact.Component
{
    render()
    {
        return Pact.h('navbar', false, {}, [
            Pact.h('a', 'Home', {href: '/'}),
            Pact.h('a', 'About', {href: '/'}),
            Pact.h('a', 'Contact', {href: '/'}),
        ]);
    }
}
```

### Navbar example using state

```js
class Navbar extends Pact.Component
{
    state = {
        links: [
            {title: 'Home', '/'},
            {title: 'About', '/about'},
            {title: 'Contact Us', '/contact'},
        ]
    };

    render()
    {
        return Pact.h('navbar', false, {}, this.state.links.map(link => {
            Pact.h('a', link.title, {href: link.href})
        }));
    }
}
```


### Clock

```js
class Clock extends Pact.Component
{
    state = {time: '10:00'}

    render()
    {
        return Pact.h('p', 'The time is {state.time}');
    }

    componentDidMount()
    {
        setInterval(_ => {
            this.setState({
                time: (new Date()).toISOString().substr(11, 8)
            })
        }, 1000);
    }
}
```
