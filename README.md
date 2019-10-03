# Pact

### A rather small Component library

Requires Lodash, EventEmitter

Although EventEmitter could definitely be removed, it's a bit redundant. I can just do `this.componentDidUpdate()` etc. 

Using a virtual DOM to render components
Children currently work, but only static children, I need to re-work `Pact.diff` & `Pact.patch`

If state has been updated but is the same, we won't redraw or rerender the DOM, only if an actual change has happened

I'm considering if `state: {key: 1}` changes to `state: {key: '1'}` adding a warning in console, letting them know
it changed from an `Int` to a `String`

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