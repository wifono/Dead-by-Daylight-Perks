
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.43.2 */

    const { Error: Error_1$2, Object: Object_1, console: console_1$1 } = globals;

    // (251:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get routes() {
    		throw new Error_1$2("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1$2("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1$2("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1$2("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1$2("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1$2("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const bookData = [
      {
        "name": "Dwight Fairfield",
        "perk_name": "Bond",
        "description": "Unlocks potential in your Aura-reading ability. The Auras of other Survivors are revealed to you when they are within a range of 20/28/36 metres.",
        "rating": 3.94,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Bond.png"
      },
      {
        "name": "Dwight Fairfield",
        "perk_name": "Prove Thyself",
        "description": "Gain a stack-able 15 % Repair Speed bonus for each Survivor within 4 metres of you, up to a maximum of 45 %. This effect is also applied to all other Survivors within that range. Prove Thyself grants 50/75/100 % bonus Bloodpoints for Co-operative actions. Prove Thyself does not stack with other instances of itself.",
        "rating": 4.25,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_ProveThyself.png"
      },
      {
        "name": "Dwight Fairfield",
        "perk_name": "Leader",
        "description": "You are able to organise a team to cooperate more efficiently. When other Survivors are within 8 metres of you, Leader increases their Action speeds for Healing, Sabotaging, Unhooking, Cleansing, Opening, and Unlocking actions by 15/20/25 %. This effect lingers for 15 seconds when leaving Leader's range. Leader does not stack with other instances of itself.",
        "rating": 3.65,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Leader.png"
      },
      {
        "name": "Meg Thomas",
        "perk_name": "Quick & Quiet",
        "description": "You do not make as much noise as others when quickly vaulting over obstacles or hiding in Lockers. Loud Noise notifications for rushing to vault Windows, or to enter or exit Lockers are completely suppressed. Quick & Quiet has a cool-down of 30/25/20 seconds.",
        "rating": 4.09,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_QuickQuiet.png"
      },
      {
        "name": "Meg Thomas",
        "perk_name": "Sprint Burst",
        "description": "When starting to run, break into a sprint at 150 % of your normal running speed for a maximum of 3 seconds. Sprint Burst causes the Exhausted Status Effect for 60/50/40 seconds. Sprint Burst cannot be used when Exhausted.",
        "rating": 4.1,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SprintBurst.png"
      },
      {
        "name": "Meg Thomas",
        "perk_name": "Adrenaline",
        "description": "You are fuelled by unexpected energy when on the verge of escape. When the Exit Gates are powered, instantly heal one Health State and sprint at 150 % of your normal Running speed for 5 seconds. Adrenaline is on hold if you are disabled at the moment it triggers and will instead activate upon being freed. If playing against The Nightmare, Adrenaline will wake you from the Dream World upon activation. Adrenaline ignores an existing Exhaustion timer, but causes the Exhausted Status Effect for 60/50/40 seconds.",
        "rating": 4.09,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Adrenaline.png"
      },
      {
        "name": "Claudette Morel",
        "perk_name": "Empathy",
        "description": "Unlocks potential in your Aura-reading ability. The Auras of dying or injured Survivors are revealed to you within a range of 64/96/128 metres. Empathy does not reveal the Aura of a Survivor currently being carried by the Killer.",
        "rating": 3.97,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Empathy.png"
      },
      {
        "name": "Claudette Morel",
        "perk_name": "Botany Knowledge",
        "description": "You transform plants found around The Campfire into tinctures that slow down bleeding. Healing speeds, as well as the efficiency of Med-Kits, are increased by 11/22/33 %.",
        "rating": 3.77,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BotanyKnowledge.png"
      },
      {
        "name": "Claudette Morel",
        "perk_name": "Self-Care",
        "description": "Unlocks the ability to heal yourself without needing a Med-Kit at 50 % of the normal Healing speed. When using a Med-Kit, its Depletion rate is decreased by 10/15/20 %.",
        "rating": 3.8,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SelfCare.png"
      },
      {
        "name": "Jake Park",
        "perk_name": "Iron Will",
        "description": "You are able to concentrate and enter a meditative-like state to numb some pain. When injured, Grunts of Pain are reduced by 50/75/100 %.",
        "rating": 4.52,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_IronWill.png"
      },
      {
        "name": "Jake Park",
        "perk_name": "Calm Spirit",
        "description": "Animals seem to trust you as they often stay calm in your presence. The chances of alerting nearby Crows are reduced by 80/90/100 % and your urge to scream from pain is suppressed.",
        "rating": 2.95,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_CalmSpirit.png"
      },
      {
        "name": "Jake Park",
        "perk_name": "Saboteur",
        "description": "Unlocks potential in your Aura-reading ability. While a Survivor is being carried, the Auras of all Hooks within 56 metres the location they were picked up at are revealed to you. Unlocks the ability to sabotage Hooks without needing a Toolbox: Sabotaging a Hook without a Toolbox takes 3 seconds. The Sabotage action has a cool-down of 90/75/60 seconds.",
        "rating": 3.51,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Saboteur.png"
      },
      {
        "name": "Nea Karlsson",
        "perk_name": "Balanced Landing",
        "description": "Your agility and cat-like reflexes are incomparable. When falling from great heights: Your Stagger duration is reduced by 75 % and your grunts are muffled by 100 %. Upon landing, you start sprinting at 150 % of your normal running speed for a maximum of 3 seconds. Balanced Landing causes the Exhausted Status Effect for 60/50/40 seconds. Balanced Landing cannot be used when Exhausted.",
        "rating": 4,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BalancedLanding.png"
      },
      {
        "name": "Nea Karlsson",
        "perk_name": "Urban Evasion",
        "description": "Years of evading the cops taught you a thing or two about stealth. When crouching, your Movement speed is increased by 90/95/100 %.",
        "rating": 3.8,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_UrbanEvasion.png"
      },
      {
        "name": "Nea Karlsson",
        "perk_name": "Streetwise",
        "description": "Long nights out taught you to do a lot with what you have got. The Depletion rate of your Items is reduced by 15/20/25 %. This effect also applies to all other Survivors within 8 metres of you and lingers for 15 seconds.",
        "rating": 3.08,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Streetwise.png"
      },
      {
        "name": "Bill Overbeck",
        "perk_name": "Left Behind",
        "description": "You will get the job done... no matter the cost. When you are the last Survivor remaining in the Trial, the Aura of the Hatch is revealed to you when you are within 24/28/32 metres.",
        "rating": 2.9,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_LeftBehind.png"
      },
      {
        "name": "Bill Overbeck",
        "perk_name": "Borrowed Time",
        "description": "You are fuelled with an unexpected energy when saving an Ally from a Hook. For 8/10/12 seconds after unhooking a Survivor, the unhooked Survivor is protected by the Endurance Status Effect. Any damage taken that would put the Survivor into the Dying State will instead trigger the Deep Wound Status Effect, after which the Survivor has 20 seconds to Mend themselves. Taking any damage while under the effect of Deep Wound or if its timer runs out will put the Survivor into the Dying State.",
        "rating": 4.61,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BorrowedTime.png"
      },
      {
        "name": "Bill Overbeck",
        "perk_name": "Unbreakable",
        "description": "Past battles have taught you a thing or two about survival. Once per Trial, you can completely recover from the Dying State. Your Recovery speed is permanently increased by 25/30/35 %.",
        "rating": 4.1,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Unbreakable.png"
      },
      {
        "name": "David King",
        "perk_name": "We're Gonna Live Forever",
        "description": "Your few friends deserve the best protection. When healing a dying Survivor, your Healing speed is increased by 100 %.  Performing any of the following actions has We're Gonna Live Forever gain 1 Token: Performing a Safe Hook Rescue. Taking a Protection Hit for an injured Survivor. Stunning the Killer to rescue a carried Survivor. Blinding the Killer to rescue a carried Survivor. Each Token grants a stack-able 25 % bonus to all Bloodpoint gains, up to a maximum of 50/75/100 %. The bonus Bloodpoints are only awarded post-Trial.",
        "rating": 4.1,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_WereGonnaLiveForever.png"
      },
      {
        "name": "David King",
        "perk_name": "Dead Hard",
        "description": "Activate-able Perk. You can take a beating. When Injured, tap into your adrenaline bank and dash forward quickly to avoid damage. Press the Active Ability button while running to dash forward. Avoid any damage during the Dash. Dead Hard causes the Exhausted Status Effect for 60/50/40 seconds. Dead Hard cannot be used when Exhausted.",
        "rating": 4.29,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DeadHard.png"
      },
      {
        "name": "David King",
        "perk_name": "No Mither",
        "description": "Go on out, kid, it is just a scratch. You suffer from the Broken Status Effect for the entire Trial. Your thick blood coagulates practically instantly: Bleeding is suppressed at all times. When injured or dying, Grunts of Pain are reduced by 0/25/50 %. You can completely recover from the Dying State.",
        "rating": 2.41,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_NoMither.png"
      },
      {
        "name": "Laurie Strode",
        "perk_name": "Sole Survivor",
        "description": "As more of your friends fall to the Killer, you become shrouded in isolation and the Killer's Aura-reading abilities towards you are disrupted. Each time a Survivor other than yourself is killed or sacrificed, Sole Survivor gains 1 Token, up to a maximum of 3 Tokens: Each Token grants a stack-able radius of 20/22/24 metres within which the Killer is unable to read your Aura, up to a maximum of 60/66/72 metres. Increases the odds of being the Obsession. The Killer can only be obsessed with one Survivor at a time.",
        "rating": 1.8,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SoleSurvivor.png"
      },
      {
        "name": "Laurie Strode",
        "perk_name": "Object of Obsession",
        "description": "A supernatural bond links you to the Killer. Whenever the Killer reads your Aura, Object of Obsession activates: The Killer's Aura is revealed to you for the same duration as they read your Aura. Your Action speeds in Repairing, Healing, and Cleansing are increased by 2/4/6 %. If you are the Obsession, your Aura is revealed to the Killer for 3 seconds every 30 seconds. Increases the odds of being the Obsession. The Killer can only be obsessed with one Survivor at a time.",
        "rating": 3.51,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_ObjectOfObsession.png"
      },
      {
        "name": "Laurie Strode",
        "perk_name": "Decisive Strike",
        "description": "Using whatever is at hand, you stab at your aggressor in an ultimate attempt to escape. After being unhooked or unhooking yourself, Decisive Strike activates for the next 40/50/60 seconds: When being grabbed or picked up by the Killer, succeed a Skill Check IconHelp skillChecks.png to automatically escape their grasp, stunning them for 5 seconds. Successfully stunning the Killer will disable Decisive Strike for the remainder of the Trial and result in you becoming the Obsession.  While Decisive Strike is active, the following interactions will deactivate it: Repairing a Generator IconHelpLoading generators.png. Healing yourself or other Survivors. Cleansing a Totem IconHelpLoading totem.png. Sabotaging a Hook IconHelpLoading hook.png. Unhooking other Survivors.  Increases the odds of being the Obsession. The Killer can only be obsessed with one Survivor at a time.",
        "rating": 4.07,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DecisiveStrike.png"
      },
      {
        "name": "Ace Visconti",
        "perk_name": "Open-Handed",
        "description": "Strengthens the potential in your and your team's Aura-reading abilities. Open-Handed increases all Aura-reading ranges by 8/12/16 metres. Open-Handed does not stack with other instances of itself.",
        "rating": 3.25,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_OpenHanded.png"
      },
      {
        "name": "Ace Visconti",
        "perk_name": "Up the Ante",
        "description": "All will be well in the end; you just know it. Your confidence strengthens the feeling of hope for those around you. For each Survivor still in the Trial, Up the Ante gains 1 Token. Each Token applies a stack-able 1/2/3 % bonus to the Luck of all Survivors, up to a maximum of 3/6/9 %.",
        "rating": 1.73,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_UpTheAnte.png"
      },
      {
        "name": "Ace Visconti",
        "perk_name": "Ace in the Hole",
        "description": "Lady Luck always seems to be throwing something good your way. When retrieving an Item from a Chest, there is a chance an Add-on will be attached to it. 100 % chance for an Add-on of Very Rare Rarity or lower. 10/25/50 % chance for a second Add-on of Uncommon Rarity or lower. Ace in the Hole allows you to keep any Add-ons your Item has equipped upon escaping.",
        "rating": 3.06,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_AceInTheHole.png"
      },
      {
        "name": "Feng Min",
        "perk_name": "Technician",
        "description": "You are apt at handling machinery with the greatest care and precision. Failing a Skill Check while repairing: Prevents the Generator Explosion. Applies the default Regression penalty. Applies an additional Regression penalty of 5/4/3 %. Technician reduces the audible range of your Generator-repairing noises by 8 metres.",
        "rating": 3.12,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Technician.png"
      },
      {
        "name": "Feng Min",
        "perk_name": "Lithe",
        "description": "After performing a rushed vault, break into a sprint at 150 % of your normal running speed for a maximum of 3 seconds. Lithe causes the Exhausted Status Effect for 60/50/40 seconds. Lithe cannot be used when Exhausted.",
        "rating": 4.2,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Lithe.png"
      },
      {
        "name": "Feng Min",
        "perk_name": "Alert",
        "description": "Your acute senses are on high alert. When the Killer breaks a Pallet or Breakable Wall, or damages a Generator, their Aura is revealed to you for 3/4/5 seconds.",
        "rating": 4.05,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Alert.png"
      },
      {
        "name": "Quentin Smith",
        "perk_name": "Wake Up!",
        "description": "Unlocks potential in your Aura-reading ability. Once all Generators are completed, Wake Up! activates: The Auras of the Exit Gate Switches are revealed to you within 128 metres. When opening an Exit Gate, your Aura is revealed to all other Survivors within 128 metres. You open Exit Gates 5/10/15 % faster.",
        "rating": 2.27,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_WakeUp.png"
      },
      {
        "name": "Quentin Smith",
        "perk_name": "Pharmacy",
        "description": "You have a knack for finding medicine. Unlocking Chests is 40/60/80 % faster. Unlocking your first Chest guarantees an Emergency Med-Kit. Pharmacy reduces the audible range of your Chest-unlocking noises by 8 metres.",
        "rating": 2.82,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Pharmacy.png"
      },
      {
        "name": "Quentin Smith",
        "perk_name": "Vigil",
        "description": "You look over your friends even in dire situations. You recover 10/15/20 % faster from the Blindness, Exhaustion, Haemorrhage, and Hindered Status Effects. This effect also applies to all other Survivors within 8 metres of you and lingers for 15 seconds.",
        "rating": 3.36,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Vigil.png"
      },
      {
        "name": "Tapp",
        "perk_name": "Tenacity",
        "description": "There is nothing stopping you. Your ferocious tenacity in dire situations allows you to crawl 30/40/50 % faster and also recover at the same time.",
        "rating": 3.47,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Tenacity.png"
      },
      {
        "name": "Tapp",
        "perk_name": "Detective's Hunch",
        "description": "Unlocks potential in your Aura-reading ability. Each time a Generator is completed, the Auras of any Generators, Chests IconHelp, and Totems within 32/48/64 metres are revealed to you for 10 seconds. If you are holding a Map that can track the corresponding objects revealed by Detective's Hunch, they are automatically added to it.",
        "rating": 4.02,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DetectivesHunch.png"
      },
      {
        "name": "Tapp",
        "perk_name": "Stake Out",
        "description": "Getting close to the Killer fills you with determination. Every 15 seconds you are standing within the Killer's Terror Radius without being chased, Stake Out gains 1 Token, up to a maximum of 2/3/4 Tokens. When Stake Out has at least 1 Token, Good Skill Checks consume 1 Token and are considered Great Skill Checks, granting an additional Progression bonus of 1 %. Great Skill Checks do not consume any Tokens.",
        "rating": 3.09,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_StakeOut.png"
      },
      {
        "name": "Kate Denson",
        "perk_name": "Dance With Me",
        "description": "When performing a rushed action to vault a Window or leave a Locker, you will not leave any Scratch Marks for the next 3 seconds. Dance With Me has a cool-down of 60/50/40 seconds.",
        "rating": 3.81,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DanceWithMe.png"
      },
      {
        "name": "Kate Denson",
        "perk_name": "Windows of Oppurtunity",
        "description": "Unlocks potential in your Aura-reading ability. The Auras of Breakable Walls, Pallets, and Windows are revealed to you within 20 metres. Windows of Opportunity has a cool-down of 30/25/20 seconds after vaulting or dropping a Pallet during a Chase.",
        "rating": 3.87,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_WindowsOfOppurtunity.png"
      },
      {
        "name": "Kate Denson",
        "perk_name": "Boil Over",
        "description": "You are a battler and do everything to escape a foe's grasp. While being carried by the Killer: Your Struggle Effects from Wiggling, causing the Killer to strafe sideways, are increased by 25/50/75 %. You obscure the Killer's ability to read the Auras of all Hooks within 10/12/14 metres of your pick-up location.",
        "rating": 2.88,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BoilOver.png"
      },
      {
        "name": "Adam Francis",
        "perk_name": "Diversion",
        "description": "Activate-able Perk. Standing within the Killer's Terror Radius while not in a Chase for 40/35/30 seconds activates Diversion. Once Diversion is activated, press the Active Ability button while crouched and motionless to throw a pebble, creating a distraction for the Killer at a distance of 20 meters. The distraction consists of the following: Loud Noise notification Scratch Marks Diversion's timer resets once the ability has been activated.",
        "rating": 3.64,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Diversion.png"
      },
      {
        "name": "Adam Francis",
        "perk_name": "Deliverance",
        "description": "After performing a Safe Hook Rescue on another Survivor, Deliverance activates: Your Self-Unhook attempts will succeed 100 % of the time. Deliverance causes the Broken Status Effect for 100/80/60 seconds after unhooking yourself.",
        "rating": 4.01,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Deliverance.png"
      },
      {
        "name": "Adam Francis",
        "perk_name": "Autodidact",
        "description": "You start the Trial with a -25 % Progression penalty for Skill Checks to heal Survivors. For every successful Skill Check completed while healing a Survivor, you receive a Token for a maximum of 3/4/5 Tokens. Each Token grants you a +15 % bonus Progression for a successful Skill Check while healing Survivors. Great Skill Checks cannot be performed while using Autodidact. Autodidact is not active when using a Med-Kit to heal.",
        "rating": 2.8,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Autodidact.png"
      },
      {
        "name": "Jeff Johansen",
        "perk_name": "Breakdown",
        "description": "Each time you are unhooked or unhook yourself, the Hook breaks and the Killer's Aura is revealed to you for 4/5/6 seconds. A Hook broken by Breakdown takes 180 seconds to respawn.",
        "rating": 2.93,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Breakdown.png"
      },
      {
        "name": "Jeff Johansen",
        "perk_name": "Aftercare",
        "description": "Unlocks potential in your Aura-reading ability. You see the Aura of the last 1/2/3 Survivor(s): You have rescued from a Hook, or who have rescued you from a Hook. You have completed a Healing action on, or who have completed a Healing action on you. They also see your Aura. All effects of Aftercare are reset upon being hooked by the Killer.",
        "rating": 3.72,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Aftercare.png"
      },
      {
        "name": "Jeff Johansen",
        "perk_name": "Distortion",
        "description": "You start the Trial with 3 Tokens. Whenever the Killer attempts to read your Aura, Distortion activates and a Token is consumed: Your Aura will not be shown to the Killer and you will not leave any Scratch Marks for the next 6/8/10 seconds. Distortion does not activate when you are in the Dying State or in a Killer Trap.",
        "rating": 3.48,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Distortion.png"
      },
      {
        "name": "Jane Romero",
        "perk_name": "Solidarity",
        "description": "Sharing painful experiences has the power to heal. When injured, healing another Survivor without using a Med-Kit also heals you with a Conversion rate of 40/45/50 %.",
        "rating": 3.14,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Solidarity.png"
      },
      {
        "name": "Jane Romero",
        "perk_name": "Poised",
        "description": "Achieving goals boosts your confidence. After a Generator is completed, you will not leave any Scratch Marks for the next 6/8/10 seconds.",
        "rating": 2.8,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Poised.png"
      },
      {
        "name": "Jane Romero",
        "perk_name": "Head On",
        "description": "When your mind is set, there better be no one standing in your way. While standing in a Locker for 3 seconds, Head On activates. When performing a rushed action to leave a Locker, stun the Killer for 3 seconds if they are within range. Head On causes the Exhausted Status Effect for 60/50/40 seconds. Head On cannot be used when Exhausted or when you have accrued Stillness Crows.",
        "rating": 4.05,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_HeadOn.png"
      },
      {
        "name": "Ash Williams",
        "perk_name": "Flip-Flop",
        "description": "You have an uncanny ability to escape the inevitable. While in the Dying State, 50 % of your Recovery progression is converted into Wiggling progression, up to a maximum of 40/45/50 %, once you are picked up by the Killer.",
        "rating": 3.88,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_FlipFlop.png"
      },
      {
        "name": "Ash Williams",
        "perk_name": "Buckle Up",
        "description": "Unlocks potential in your Aura-reading ability. You can determine the Recovery progress of dying Survivors by the intensity of their Aura at a distance of up to 48 metres away. When healing another Survivor from the Dying State to the Injured State, the Killer's Aura is revealed to the both of you for 4/5/6 seconds.",
        "rating": 2.64,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BuckleUp.png"
      },
      {
        "name": "Ash Williams",
        "perk_name": "Mettle of Man",
        "description": "Evil has a way of always finding you. After triggering your third Protection Hit, Mettle of Man activates and you are protected by the Endurance Status Effect: Any damage taken that would put you into the Dying State from the Injured State is blocked. When you are healed again, your Aura will be revealed to the Killer whenever you are farther than 12/14/16 metres away. Mettle of Man deactivates the next time you are put into the Dying State. Increases the odds of being the Obsession. The Killer can only be obsessed with one Survivor at a time.",
        "rating": 2.8,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_MettleOfMan.png"
      },
      {
        "name": "Nancy Wheeler",
        "perk_name": "Better Together",
        "description": "You seek justice and uncover the truth no matter what obstacle stands in your way. While repairing a Generator, its Aura is revealed in yellow to all other Survivors located within 32 metres. If the Killer downs a Survivor while you are repairing a Generator, you see the Auras of all other Survivors for 8/9/10 seconds.",
        "rating": 3.06,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BetterTogether.png"
      },
      {
        "name": "Nancy Wheeler",
        "perk_name": "Fixated",
        "description": "When you have a goal in mind, there is no turning back; better to ask forgiveness than permission. You walk 10/15/20 % faster and can see your own Scratch Marks.",
        "rating": 4.01,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Fixated.png"
      },
      {
        "name": "Nancy Wheeler",
        "perk_name": "Inner Strength",
        "description": "You look inwards and trust your instincts when you feel lost and alone. Each time you cleanse a Totem, Inner Strength activates: You are automatically healed 1 Health State when hiding inside a Locker for 10/9/8 seconds while injured or suffering from the Deep Wound Status Effect. Inner Strength does not activate if you currently suffer from the Broken Status Effect.",
        "rating": 4.12,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_InnerStrength.png"
      },
      {
        "name": "Steven Harrington",
        "perk_name": "Babysitter",
        "description": "While you have a reputation for being self-centred, you risk it all to help those in need. When you unhook a Survivor, the rescued Survivor will leave neither Scratch Marks nor Pools of Blood for the next 4/6/8 seconds. Both you and the Killer see each other's Aura for 4 seconds.",
        "rating": 2.2,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Babysitter.png"
      },
      {
        "name": "Steven Harrington",
        "perk_name": "Camaraderie",
        "description": "Life has taught you the importance of friendship which has given you strength. While you are on the Hook in the Struggle Phase, Camaraderie activates. If another Survivor is within 16 metres of your Hook while Camaraderie is active, the Struggle Phase timer is paused for 26/30/34 seconds.",
        "rating": 3.14,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Camaraderie.png"
      },
      {
        "name": "Steven Harrington",
        "perk_name": "Second Wind",
        "description": "You have learnt to avoid awkward situations with parents. Part of you still thinks your best option is to run away and hope things will take care of themselves. When you heal another Survivor for the equivalent of 1 Health State, Second Wind activates: The next time you are unhooked or unhook yourself, you suffer from the Broken Status Effect until Second Wind deactivates. You are automatically healed 1 Health State after 28/24/20 seconds. While Second Wind is active, the following conditions will deactivate it: Successfully being healed by Second Wind. Being put into the Dying State before the timer elapses. Second Wind does not activate if you already suffer from the Broken Status Effect.",
        "rating": 3.45,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SecondWind.png"
      },
      {
        "name": "Yui Kimura",
        "perk_name": "Lucky Break",
        "description": "You have had your share of scrapes and bruises, but luck is always on your side. Whenever you are in the Injured State, Lucky Break activates: Bleeding and Scratch Marks are suppressed for a maximum of 40/50/60 seconds, after which Lucky Break is disabled for the remainder of the Trial. Lucky Break deactivates when you are Healthy or in the Dying State.",
        "rating": 3.95,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_LuckyBreak.png"
      },
      {
        "name": "Yui Kimura",
        "perk_name": "Any Means Necessary",
        "description": "You stand up for yourself, using whatever's on hand to gain an advantage. Press and hold the Active Ability button for 4 seconds while standing beside a dropped Pallet to reset it to its upright position. Any Means Necessary has a cool-down of 100/80/60 seconds.",
        "rating": 3.86,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_AnyMeansNecessary.png"
      },
      {
        "name": "Yui Kimura",
        "perk_name": "Breakout",
        "description": "You kick into high gear when someone is in trouble, inspiring them to overcome any obstacle. When within 6 metres of a carried Survivor, you gain the Haste Status Effect, moving at an increased speed of 5/6/7 %. The carried Survivor's Wiggling speed is increased by 20 %.",
        "rating": 3.84,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Breakout.png"
      },
      {
        "name": "Zarina Kassir",
        "perk_name": "Off the Record",
        "description": "You have learnt that a quiet approach is sometimes best. After being unhooked or unhooking yourself, Off the Record activates for the next 60/70/80 seconds: Your Aura will not be shown to the Killer if they attempt to read it. When injured, Grunts of Pain are reduced by 100 %.",
        "rating": 3.24,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_OffTheRecord.png"
      },
      {
        "name": "Zarina Kassir",
        "perk_name": "Red Herring",
        "description": "You have noticed that people pay attention to whatever makes the loudest noise. After repairing a Generator for at least 3 seconds, its Aura is highlighted to you in yellow. The Generator stays highlighted until it is either fully repaired, you start repairing another Generator, or enter a Locker. Entering a Locker will trigger a Loud Noise notification for the Killer at the highlighted Generator's location. Red Herring has a cool-down of 60/50/40 seconds.",
        "rating": 3.73,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_RedHerring.png"
      },
      {
        "name": "Zarina Kassir",
        "perk_name": "For the People",
        "description": "You risk life and injury for others. For the People is only active while at full health. Press the Active Ability button while healing another Survivor without a Med-Kit to instantly heal them 1 Health State. You become the Obsession. For the People causes the Broken Status Effect for 110/100/90 seconds after using it. Reduces the odds of being the Obsession. The Killer can only be obsessed with one Survivor at a time.",
        "rating": 4.07,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_ForThePeople.png"
      },
      {
        "name": "Cheryl Mason",
        "perk_name": "Soul Guard",
        "description": "You have been through immense hardship and you're stronger for it. After being healed from or having recovered from the Dying State, Soul Guard grants you the Endurance Status Effect for the next 4/6/8 seconds. Any damage taken that would put you into the Dying State will instead trigger the Deep Wound Status Effect, after which you have 20 seconds to Mend yourself. Taking any damage while under the effect of Deep Wound or if its timer runs out will put you into the Dying State. Soul Guard allows you to completely recover from the Dying State when you are affected by the Cursed Status Effect. Soul Guard has a cool-down of 30 seconds.",
        "rating": 4,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SoulGuard.png"
      },
      {
        "name": "Cheryl Mason",
        "perk_name": "Blood Pact",
        "description": "It is as if a latent part of yourself has awakened. You feel like you can reach out beyond yourself for assistance. When you or the Obsession are injured, you both see each other's Auras. After healing the Obsession or being healed by the Obsession, you both gain the Haste Status Effect, moving at an increased speed of 5/6/7 % until you are no longer within 16 metres of each other. If you are the Obsession, Blood Pact deactivates. Reduces the odds of being the Obsession. The Killer can only be obsessed with one Survivor at a time.",
        "rating": 3.42,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BloodPact.png"
      },
      {
        "name": "Cheryl Mason",
        "perk_name": "Repressed Alliance",
        "description": "You are accustomed to being hunted by malicious forces, and you have begun using it to your advantage. After repairing Generators for a total of 80/70/60 seconds, Repressed Alliance activates: Press the Active Ability button to call upon The Entity to block the Generator you are currently repairing for 30 seconds, after which Repressed Alliance deactivates. The Aura of the blocked Generator is revealed to all Survivors in white.",
        "rating": 3.18,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_RepressedAlliance.png"
      },
      {
        "name": "Felix Richter",
        "perk_name": "Visionary",
        "description": "You are remarkably focused on your means of escape. The Auras of Generators are revealed to you within 32 metres. Each time a Generator is completed, Visionary is disabled for 20/18/16 seconds.",
        "rating": 2.83,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Visionary.png"
      },
      {
        "name": "Felix Richter",
        "perk_name": "Desperate Measures",
        "description": "You refuse to fail, even during your darkest hour. Increases Healing and Unhooking speeds by 10/12/14 % for each injured, hooked, or dying Survivor, up to a maximum of 40/48/56 %.",
        "rating": 4.08,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DesperateMeasures.png"
      },
      {
        "name": "Felix Richter",
        "perk_name": "Built to Last",
        "description": "You know how to get the most out of your tools. Once per Trial, your carried Item will refill 30/40/50 % of its Charges 10 seconds after having depleted it.",
        "rating": 4,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BuiltToLast.png"
      },
      {
        "name": "Elodie Rakoto",
        "perk_name": "Appraisal",
        "description": "You have a careful eye that notices what many overlook. Start the Trial with 3 Tokens: When a Chest has already been opened, consume 1 Token to rummage through it for an Item. Rummage through Chests 40/60/80 % faster. Rummaging is only available once per Chest.",
        "rating": 3.4,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Appraisal.png"
      },
      {
        "name": "Elodie Rakoto",
        "perk_name": "Deception",
        "description": "Your adventurous lifestyle requires moments of crafty misdirection. Interact with a Locker while holding the Sprint button to trigger a Loud Noise notification for the Killer at your location instead of entering the Locker. You will not leave any Scratch Marks for the next 3 seconds. Deception can only be triggered once every 60/50/40 seconds.",
        "rating": 3.94,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Deception.png"
      },
      {
        "name": "Elodie Rakoto",
        "perk_name": "Power Struggle",
        "description": "You have never given up and you are not about to start now. While being carried by The Killer, reaching 35/30/25 % Wiggling progression activates Power Struggle: You can drop a nearby, standing Pallet to stun The Killer and escape their grasp. Power Struggle deactivates after triggering successfully.",
        "rating": 3.41,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_PowerStruggle.png"
      },
      {
        "name": "Yun-Jin Lee",
        "perk_name": "Fast Track",
        "description": "Sometimes the sacrifice of others is necessary to get ahead. Whenever another Survivor is hooked, Fast Track gains 1/2/3 Token(s), up to a maximum of 9/18/27 Tokens. You consume all accumulated Tokens after a Great Skill Check on a Generator. Each Token grants a stack-able 1 % Progression bonus in addition to the default Progression bonus for succeeding a Great Skill Check.",
        "rating": 3.38,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_FastTrack.png"
      },
      {
        "name": "Yun-Jin Lee",
        "perk_name": "Smash Hit",
        "description": "When your rival makes a mistake, you seize the opportunity. After stunning the Killer with a Pallet, break into a sprint at 150 % of your normal running speed for a maximum of 4 seconds. Smash Hit causes the Exhausted Status Effect for 60/50/40 seconds. Smash Hit cannot be used when Exhausted.",
        "rating": 4.01,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SmashHit.png"
      },
      {
        "name": "Yun-Jin Lee",
        "perk_name": "Self-Preservation",
        "description": "Life is unforgiving. The more confirmation you get of that, the more prepared you become. Whenever another Survivor is hit with a Basic or Special Attack within 16 metres of you, Self-Preservation activates: Scratch Marks, Grunts of Pain when injured, and Bleeding are suppressed for the next 6/8/10 seconds.",
        "rating": 2.98,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SelfPreservation.png"
      },
      {
        "name": "Jill Valentine",
        "perk_name": "Counterforce",
        "description": "You know how to withstand an enemy stronger than you, and it starts with hunting down and knocking out their support. You cleanse Totems 20 % faster. Gain another, stack-able 20 % Cleansing Speed bonus per cleansed Totem. After cleansing a Totem, the Aura of the Totem farthest from you is revealed to you for 2/3/4 seconds.",
        "rating": 4.01,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Counterforce.png"
      },
      {
        "name": "Jill Valentine",
        "perk_name": "Resurgence",
        "description": "You have come back from near impossible odds... and you will do it again. After being unhooked or unhooking yourself, instantly gain 40/45/50 % to your Healing progress.",
        "rating": 4.04,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Resurgence.png"
      },
      {
        "name": "Jill Valentine",
        "perk_name": "Blast Mine",
        "description": "When direct combat is not an option, you still find ways to strike back. After repairing Generators for a total of 66 %, Blast Mine activates: After repairing a Generator for at least 3 seconds, press the Ability button to install a Trap, which stays active for 35/40/45 seconds. The Aura of Trapped Generators are revealed in yellow to all Survivors. A Generator can only be affected by one instance of Blast Mine at a time. When the Killer damages a Trapped Generator, the Trap explodes, stunning them and blinding anyone nearby. Blast Mine deactivates after triggering successfully.",
        "rating": 4.04,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BlastMine.png"
      },
      {
        "name": "Leon Kennedy",
        "perk_name": "Bite the Bullet",
        "description": "Pain hurts you as much as anyone, but you would prefer others do not know that. When healing, you make no noise, including Grunts of Pain: Failed Healing Skill Checks do not trigger a Loud Noise notification and only apply a Regression penalty of 3/2/1 %.",
        "rating": 3.62,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BiteTheBullet.png"
      },
      {
        "name": "Leon Kennedy",
        "perk_name": "Flashbang",
        "description": "You have adapted to a world in chaos and making what you can from the debris. After repairing Generators for a total of 70/60/50 %, Flashbang activates: Enter a Locker while empty-handed and press the Ability button to craft a Flash Grenade. The Flash Grenade is left behind when escaping the Trial.",
        "rating": 4.1,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Flashbang.png"
      },
      {
        "name": "Leon Kennedy",
        "perk_name": "Rookie Spirit",
        "description": "You keep a careful eye on objectives when they are slipping away. While repairing Generators, complete 5/4/3 Good or Great Skill Checks to activate Rookie Spirit for the remainder of the Trial: Once active, the Auras of any regressing Generators are revealed to you.",
        "rating": 3.99,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_RookieSpirit.png"
      },
      {
        "name": "Basic",
        "perk_name": "Dark Sense",
        "description": "Unlocks potential in your Aura-reading ability. Each time a Generator is completed, the Killer's Aura is revealed to you for 5 seconds and for 5/7/10 seconds when the last Generator is completed.",
        "rating": 3.57,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DarkSense.png"
      },
      {
        "name": "Basic",
        "perk_name": "Deja Vu",
        "description": "Unlocks potential in your Aura-reading ability. Paranoia paired with your horror of failure helps prepare you from repeating the same mistakes. The Auras of 3 Generators in closest proximity to one another are revealed to you for 30/45/60 seconds at the start of the Trial, and each time a Generator is completed. If you are holding a Map, Generators revealed by Déjà Vu are automatically added to it.",
        "rating": 2.96,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DejaVu.png"
      },
      {
        "name": "Basic",
        "perk_name": "Hope",
        "description": "The growing odds of a successful escape fill you with hope and give you wings. As soon as the Exit Gates are powered, you gain a 5/6/7 % Haste Status Effect for 120 seconds.",
        "rating": 3.08,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Hope.png"
      },
      {
        "name": "Basic",
        "perk_name": "Kindred",
        "description": "Unlocks potential in your Aura-reading ability. While you are hooked: The Auras of all Survivors are revealed to one another. Whenever the Killer is within 8/12/16 metres of your Hook, their Aura is revealed to all Survivors. While another Survivor is hooked: The Auras of all other Survivors are revealed to you. Whenever the Killer is within 8/12/16 metres of the hooked Survivor, their Aura is revealed to you.",
        "rating": 4.5,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Kindred.png"
      },
      {
        "name": "Basic",
        "perk_name": "Lightweight",
        "description": "Your running is light and soft, making your tracks harder to follow. Your Scratch Marks start to disappear 1/2/3 seconds sooner.",
        "rating": 2.92,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Lightweight.png"
      },
      {
        "name": "Basic",
        "perk_name": "No One Left Behind",
        "description": "It is inconceivable to leave someone behind. Once at least one Exit Gate has been opened, No One Left Behind activates: Gain a 30/40/50 % Action Speed bonus to Unhooking and Healing other Survivors. The Auras of all other Survivors are revealed to you. No One Left Behind grants 50/75/100 % bonus Bloodpoints for actions in the Altruism Category.",
        "rating": 2.35,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_NoOneLeftBehind.png"
      },
      {
        "name": "Basic",
        "perk_name": "Plunderer's Instinct",
        "description": "Unlocks potential in your Aura-reading ability. The Auras of closed Chests and dropped Items throughout the Trial Grounds are revealed to you within 16/24/32 metres. Grants a considerably better chance at finding an Item of a higher Rarity from Chests.",
        "rating": 3.71,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_PlunderersInstinct.png"
      },
      {
        "name": "Basic",
        "perk_name": "Premonition",
        "description": "You have the undeniable capability to sense danger. Get an auditory warning when looking in the Killer's direction within a 45 ° cone within 36 metres. Premonition has a cool-down of 60/45/30 seconds each time it activates.",
        "rating": 2.18,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Premonition.png"
      },
      {
        "name": "Basic",
        "perk_name": "Resilience",
        "description": "You are motivated in dire situations. When injured, your Action speeds in Repairing, Healing, Sabotaging, Unhooking, Vaulting, Cleansing, Opening, and Unlocking are increased by 3/6/9 %.",
        "rating": 4.1,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Resilience.png"
      },
      {
        "name": "Basic",
        "perk_name": "Slippery Meat",
        "description": "You have developed an efficient way to get off Hooks. Grants 3 additional Self-Unhook attempts. Your Self-Unhook chance is increased by 2/3/4 %.",
        "rating": 2.35,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SlipperyMeat.png"
      },
      {
        "name": "Basic",
        "perk_name": "Small Game",
        "description": "You have the undeniable capability to sense danger. Get an auditory warning when looking in the direction of Totems in a 45 ° cone within 8/10/12 metres. Small Game has a cool-down of 15/12/10 seconds each time it activates. For each Dull or Hex Totem cleansed by any Player, Small Game gains 1 Token: Each Token decreases the Detection cone's angle by 5 °, down to a minimum of 20 °.",
        "rating": 3.71,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SmallGame.png"
      },
      {
        "name": "Basic",
        "perk_name": "Spine Chill",
        "description": "An unnatural tingle warns you of impending doom. Whenever the Killer is looking in your direction when within 36 metres of you, Spine Chill activates: Skill Check Trigger odds are increased by 10 %. Skill Check Success zones are reduced by 10 %. Your Action speeds in Repairing, Healing, Sabotaging, Unhooking, Vaulting, Cleansing, Opening, and Unlocking are increased by 2/4/6 %.",
        "rating": 4.45,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SpineChill.png"
      },
      {
        "name": "Basic",
        "perk_name": "This Is Not Happening",
        "description": "You perform at your best when you are under extreme stress. When injured, the Success zone of Great Skill Checks while Repairing, Healing, and Sabotaging is increased by 10/20/30 %.",
        "rating": 2.06,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_ThisIsNotHappening.png"
      },
      {
        "name": "Hag",
        "perk_name": "Hex: The Third Seal",
        "description": "A Hex that hinders one's Aura-reading ability. Hitting a Survivor while the Hex Totem is active applies the Blindness Status Effect. This effect applies to the last 4 Survivors hit. The Hex effects persist as long as the related Hex Totem is standing.",
        "rating": 2.92,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_TheThirdSeal.png"
      },
      {
        "name": "Wraith",
        "perk_name": "Shadowborn",
        "description": "You have a keen vision in the darkness of the night. Your Field of View is increased by 15 °. Field of View gains do not stack.",
        "rating": 3,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Shadowborn.png"
      },
      {
        "name": "Huntress",
        "perk_name": "Hex: Huntress Lullaby",
        "description": "A Hex rooting its power in despair. Your hunt is an irresistible song of dread which muddles your prey's attention. Survivors receive a 6 % Regression penalty when missing any Skill Check. Each time a Survivor is hooked, Huntress Lullaby grows in power: • 1 to 4 Tokens: Time between the Skill Check warning sound and the Skill Check becomes shorter. • 5 Tokens: No Skill Check warning. The Hex effects persist as long as the related Hex Totem is standing.",
        "rating": 3.41,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_HuntressLullaby.png"
      },
      {
        "name": "Pig",
        "perk_name": "Surveillance",
        "description": "Unlocks potential in one's Aura-reading ability. All regressing Generators will be highlighted by a white Aura. Once regression ends, Generators will be highlighted by a yellow Aura for 16 seconds. Noises created by Generator Repairs are audible at an additional 8 metres.",
        "rating": 4.11,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Surveillance.png"
      },
      {
        "name": "Oni",
        "perk_name": "Nemesis",
        "description": "You seek retribution on those who have wronged you. A Survivor who blinds or stuns you using a Pallet or a Locker becomes your Obsession. Anytime a new Survivor becomes the Obsession, they are affected by the Oblivious Status Effect for 60 seconds and their Aura is revealed to you for 4 seconds. You can only be obsessed with one Survivor at a time.",
        "rating": 3.27,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Nemesis.png"
      },
      {
        "name": "Doctor",
        "perk_name": "Monitor & Abuse",
        "description": "Meticulous in your approach, terrifying in your application. While in a Chase, your Terror Radius is increased by 8 metres. Otherwise, your Terror Radius is decreased by 8 metres and your Field of View is increased by 10 °. Field of View gains do not stack.",
        "rating": 4.05,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_MonitorAbuse.png"
      },
      {
        "name": "Hillbilly",
        "perk_name": "Tinkerer",
        "description": "When a Generator is repaired to 85 %, you receive a Loud Noise notification and your Terror Radius is reduced to 0 metres for 12 seconds.",
        "rating": 4.52,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Tinkerer.png"
      },
      {
        "name": "Wraith",
        "perk_name": "Predator",
        "description": "Your acute tracking ability allows you to hone in on disturbances left by running Survivors. Scratch Marks left by Survivors will spawn slightly/moderately/considerably closer together.",
        "rating": 2.27,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Predator.png"
      },
      {
        "name": "Trapper",
        "perk_name": "Brutal Strength",
        "description": "Your great strength allows you to shred through your prey's defences. Destroy dropped Pallets and damage Generators 20 % faster.",
        "rating": 4.04,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BrutalStrength.png"
      },
      {
        "name": "Hillbilly",
        "perk_name": "Enduring",
        "description": "You are resilient to pain. You reduce the duration of Pallet Stuns by 50 %.",
        "rating": 4.11,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Enduring.png"
      },
      {
        "name": "Hillbilly",
        "perk_name": "Lightborn",
        "description": "Unlike other beasts of The Fog, you have adapted to light. Resistance to Blindness is increased by 80 %. Recovery from Blindness is increased by 50 %.",
        "rating": 3.98,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Lightborn.png"
      },
      {
        "name": "Cannibal",
        "perk_name": "Franklin's Demise",
        "description": "Your vicious Basic Attacks make the Survivors drop their Item on impact. The lost Item is damaged in the fall, losing 10 % of its base amount of Charges.",
        "rating": 3.41,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_FranklinsDemise.png"
      },
      {
        "name": "Trapper",
        "perk_name": "Unnerving Presence",
        "description": "Your presence alone instils great fear. Survivors within your Terror Radius have a 10 % greater chance of triggering Skill Checks when repairing, healing or sabotaging. Triggered Skill Checks' success zones are reduced by 60 %.",
        "rating": 2.69,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_UnnervingPresence.png"
      },
      {
        "name": "Myers",
        "perk_name": "Play with Your Food",
        "description": "You become obsessed with one Survivor. Every time you chase your Obsession and let them escape, you receive a Token up to a maximum of 3 Tokens. Each Token increases your Movement speed by 5 %. Each offensive action spends 1 Token. You can only be obsessed with one Survivor at a time.",
        "rating": 3.6,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_PlayWithYourFood.png"
      },
      {
        "name": "Hag",
        "perk_name": "Hex: Devour Hope",
        "description": "A Hex rooting its power on hope. The false hope of Survivors ignites your hunger. When a Survivor is rescued from a Hook at least 24 metres away, Devour Hope receives a Token. • 2 Tokens: Gain a 3/4/5 % Haste Status Effect 10 seconds after hooking a Survivor, for a duration of 10 seconds. • 3 Tokens: Survivors suffer from the Exposed Status Effect. • 5 Tokens: Grants the ability to kill Survivors by your own hand. The Hex effects persist as long as the related Hex Totem is standing.",
        "rating": 4.02,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DevourHope.png"
      },
      {
        "name": "Basic",
        "perk_name": "Iron Grasp",
        "description": "Your powerful hold onto the Survivors causes escapes to be nearly impossible. Effects of Survivor struggling are reduced by 75 %. Time to struggle out of your grasp is increased by 12 %.",
        "rating": 3.39,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_IronGrasp.png"
      },
      {
        "name": "Basic",
        "perk_name": "We'll Make It",
        "description": "Helping others heightens your morale. For each Survivor you rescue from a Hook, gain an additional 100 % speed increase to healing up others for 90 seconds. Cumulative Healing Speed bonuses cannot exceed 100 %.",
        "rating": 4.17,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_WellMakeIt.png"
      },
      {
        "name": "Cannibal",
        "perk_name": "Knock Out",
        "description": "The trauma caused by your brutal attacks makes crying for help painfully difficult. Dying Survivors' Auras are not revealed to other Survivors when they are standing outside of a range of 16 metres.",
        "rating": 3.33,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_KnockOut.png"
      },
      {
        "name": "Basic",
        "perk_name": "Bitter Murmur",
        "description": "Unlocks potential in one's Aura-reading ability. Each time a Generator is fully repaired, Survivors within 16 metres of the completed Generator will be revealed for 5 seconds. When the last Generator is fully repaired, all the Survivors' Auras are revealed for 10 seconds.",
        "rating": 3.99,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BitterMurmur.png"
      },
      {
        "name": "Basic",
        "perk_name": "Deerstalker",
        "description": "Unlocks potential in one's Aura-reading ability. Reveals dying Survivors' Auras when standing within 36 metres.",
        "rating": 3.13,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Deerstalker.png"
      },
      {
        "name": "Deathslinger",
        "perk_name": "Gear Head",
        "description": "You've got an ear for well-oiled gears. After hitting a Survivor 2 times with your Basic Attack, Gearhead activates for 35/40/45 seconds. Each time a Survivor completes a Good or Great Skill Check while repairing, the Generator will be revealed by a yellow Aura for as long as it is being repairing.",
        "rating": 2.86,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_GearHead.png"
      },
      {
        "name": "Nurse",
        "perk_name": "A Nurse's Calling",
        "description": "Unlocks potential in one's Aura-reading ability. The Auras of Survivors who are healing or being healed are revealed to you when they are within a range of 28 metres,",
        "rating": 3.64,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_ANursesCalling.png"
      },
      {
        "name": "Pig",
        "perk_name": "Hangman's Trick",
        "description": "Unlocks potential in one's Aura-reading ability. All regressing Generators will be highlighted by a white Aura. Once regression ends, Generators will be highlighted by a yellow Aura for 16 seconds. Noises created by Generator Repairs are audible at an additional 8 metres.",
        "rating": 3.16,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_HangmansTrick.png"
      },
      {
        "name": "Basic",
        "perk_name": "Hex: No One Escapes Death",
        "description": "A Hex rooting its power on hope. You are animated by the power of your Hex Totem when the Survivors are on the verge of escaping. Once the Exit Gates are powered, if there is a Dull Totem remaining on the Map, this Hex is applied to  While Hex: No One Escapes Death is active, Survivors suffer from the Exposed Status Effect and your Movement speed is increased by 4 %. The Hex effects persist as long as the related Hex Totem is standing.",
        "rating": 4.01,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_NoOneEscapesDeath.png"
      },
      {
        "name": "Pyramid Head",
        "perk_name": "Trail Of Torment",
        "description": "You guide your victims along a path of pain and punishment. After kicking a Generator, you become Undetectable for as long as the Generator is regressing or a Survivor is put into the Dying State by any means. During this time, the Generator's Aura is revealed in yellow to all Survivors. Trail of Torment can only be triggered once every 80/70/60 seconds.",
        "rating": 3.88,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_TrailOfTorment.png"
      },
      {
        "name": "Doctor",
        "perk_name": "Overcharge",
        "description": "You are fuelled by your hate for progress. Overcharge a Generator by performing the Damage Generator action. The next Survivor interacting with that Generator is faced with a tremendously difficult Skill Check. Failing the Skill Check results in an additional 5 % Regression penalty. Succeeding the Skill Check grants no progress, but prevents the Generator Explosion.",
        "rating": 3.33,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Overcharge.png"
      },
      {
        "name": "Freddy",
        "perk_name": "Fire Up",
        "description": "The increased pressure of losing your preys fills you with anger and gives you unsuspected motivation. Each time the Survivors complete repairs on a Generator, Fire Up grows in power. • For each Generator completed, gain a stack-able 4 % buff to Picking-Up, Dropping, Pallet Breaking, Generator Damaging and Vaulting speeds for the remainder of the Trial.",
        "rating": 3.83,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_FireUp.png"
      },
      {
        "name": "Spirit",
        "perk_name": "Spirit Fury",
        "description": "Each Pallet you break magnifies the wrath of The Entity. After breaking 2 Pallets, the next time you are stunned by a Pallet, The Entity will instantly break it. You still suffer from the stun effect penalty.",
        "rating": 3.96,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SpiritFury.png"
      },
      {
        "name": "Demogorgon",
        "perk_name": "Mindbreaker",
        "description": "Your distressing presence drains and weakens your prey. While repairing Generators, Survivors are afflicted by the Exhausted Status Effect. Any existing Exhaustion timers are paused while the Survivor is repairing a Generator. After ending the Repair action, the Survivor is afflicted by the Exhausted Status Effect for 3/4/5 seconds.",
        "rating": 2.7,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Mindbreaker.png"
      },
      {
        "name": "Basic",
        "perk_name": "Spies from the Shadows",
        "description": "The Crows found in the world can communicate directly with you. 100 % of the time, cawing Crows give you a visual cue when you are within a range of 36 metres. Spies from the Shadows has a cool-down of 5 seconds.",
        "rating": 3.36,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SpiesFromTheShadows.png"
      },
      {
        "name": "Spirit",
        "perk_name": "Hex: Haunted Ground",
        "description": "Two trapped Hex Totems will spawn in the Trial. When one of the two trapped Hex Totems is cleansed by a Survivor, all Survivors suffer from the Exposed Status Effect for 60 seconds. The remaining trapped Hex Totem immediately becomes a Dull Totem.",
        "rating": 4.03,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_HauntedGround.png"
      },
      {
        "name": "Spirit",
        "perk_name": "Rancor",
        "description": "You become obsessed with one  Each time a Generator is completed, the Obsession sees your Aura for 3 seconds. Each time a Generator is completed, all Survivors' locations are revealed to you for 3 seconds. Once all Generators are completed, the Obsession has the Exposed Status Effect and the Killer can kill the  You can only be obsessed with one Survivor at a time.",
        "rating": 3.35,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Rancor.png"
      },
      {
        "name": "Legion",
        "perk_name": "Discordance",
        "description": "Any Generator within a range of 64/96/128 metres that is being repaired by 2 or more Survivors is marked by a yellow Aura. When the Generator is first highlighted, Discordance triggers a Loud Noise notification on the Generator. After the Generator is no longer within range or is being repaired by just 1 Survivor, the highlighted Aura remains for another 4 seconds.",
        "rating": 4.34,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Discordance.png"
      },
      {
        "name": "Legion",
        "perk_name": "Mad Grit",
        "description": "While carrying a Survivor, you suffer no cool-down on missed attacks and successfully hitting another Survivor will pause the carried Survivor's wiggle timer for 4 seconds.",
        "rating": 2.89,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_MadGrit.png"
      },
      {
        "name": "Legion",
        "perk_name": "Iron Maiden",
        "description": "You open Lockers 50 % faster. Survivors who exit Lockers suffer from the Exposed Status Effect for 15 seconds and their location is revealed for 4 seconds.",
        "rating": 3.46,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_IronMaiden.png"
      },
      {
        "name": "Demogorgon",
        "perk_name": "Cruel Limits",
        "description": "Your ties to the otherworldly manifest when your prey attempts to get away. Each time a Generator is repaired, all Windows and vault locations within a radius of 32 metres from the completed Generator are blocked for all Survivors for the next 20/25/30 seconds.",
        "rating": 2.37,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_CruelLimits.png"
      },
      {
        "name": "Blight",
        "perk_name": "Dragon's Grip",
        "description": "After kicking a Generator Generator}}, for the next 30 seconds, the first Survivor that interacts with it will scream, revealing their location for 4 seconds, and becoming afflicted with the Exposed Status Effect for 60 seconds. Dragon's Grip has a cool-down of 120/100/80 seconds.",
        "rating": 3.67,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DragonsGrip.png"
      },
      {
        "name": "Ghost Face",
        "perk_name": "I'm All Ears",
        "description": "Your keen senses are sharpened in the dark Realm of The Entity. Unlocks potential in one's Aura-reading ability. Any Survivor performing a rushed action within 48 metres from your location will have their Aura revealed to you for 6 seconds. I'm All Ears can only be triggered once every 40 seconds.",
        "rating": 3.99,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_ImAllEars.png"
      },
      {
        "name": "Basic",
        "perk_name": "Unrelenting",
        "description": "You recuperate faster from missed attacks made with your main weapon. The cool-down of missed Basic Attacks is reduced by 30 %.",
        "rating": 2.93,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Unrelenting.png"
      },
      {
        "name": "Trapper",
        "perk_name": "Agitation",
        "description": "You get excited in anticipation of hooking your prey. Increases your Movement speed while transporting bodies by 18 %. While transporting a body, your Terror Radius is increased by 12 metres.",
        "rating": 3.68,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Agitation.png"
      },
      {
        "name": "Wraith",
        "perk_name": "Bloodhound",
        "description": "Like a hunting scent hound, you smell traces of blood at a great distance. Fresh Blood Stains are considerably more discernible than normal and can be tracked for 4 seconds longer than normal.",
        "rating": 2.94,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Bloodhound.png"
      },
      {
        "name": "Doctor",
        "perk_name": "Overwhelming Presence",
        "description": "Your presence alone instils great fear. Survivors within your Terror Radius suffer from inefficiency. Affected Survivors' Item Consumption rates are increased by 100 %.",
        "rating": 2.52,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_OverwhelmingPresence.png"
      },
      {
        "name": "Freddy",
        "perk_name": "Blood Warden",
        "description": "As soon as the Exit Gate is opened, Blood Warden is activated. The Auras of any Survivors located within Exit Gate areas are revealed to you. Once per Trial, hooking a Survivor while Blood Warden is active calls upon The Entity to block both Exits for all Survivors for 60 seconds.",
        "rating": 3.17,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BloodWarden.png"
      },
      {
        "name": "Pig",
        "perk_name": "Make Your Choice",
        "description": "When a Survivor rescues another Survivor from a Hook that is at least 32 metres away from you, Make Your Choice triggers and applies the Exposed Status Effect on the rescuer for 60 seconds. Make Your Choice has a cool-down of 60 seconds.",
        "rating": 4.08,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_MakeYourChoice.png"
      },
      {
        "name": "Plague",
        "perk_name": "Infectious Fright",
        "description": "The cries of the unfaithful make your heart leap. Any Survivors that are within the Killer's Terror Radius while another Survivor is put into the Dying State with a Basic Attack will yell and reveal their current location to the Killer for 6 seconds.",
        "rating": 3.59,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_InfectiousFright.png"
      },
      {
        "name": "Nurse",
        "perk_name": "Thanatophobia",
        "description": "Their courage fades in the face of their undeniable mortality. For each injured, dying or hooked Survivor, all Survivors receive a penalty of 4/4.5/5 % to their Repair, Sabotage, and Totem-Cleansing speed, stack-able up to a maximum of 16/18/20%.",
        "rating": 4.06,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Thanatophobia.png"
      },
      {
        "name": "Huntress",
        "perk_name": "Territorial Imperative",
        "description": "Unlocks potential in one's Aura-reading ability. Survivors' Auras are revealed to you for 3 seconds when they enter the Basement and you are more than 32 metres away from the Basement entrance. Territorial Imperative can only be triggered once every 20 seconds.",
        "rating": 2.24,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_TerritorialImperative.png"
      },
      {
        "name": "Myers",
        "perk_name": "Save the Best for Last",
        "description": "You become obsessed with one Survivor. Earn a Token for each successful hit that is not dealt to the Obsession. Each Token grants a stack-able 5 % cool-down reduction on successful attacks. You can earn up to 8 Tokens. Attacking your Obsession will make you lose 2 Tokens. You can no longer gain Tokens if your Obsession is sacrificed or killed. You can only be obsessed with one Survivor at a time.",
        "rating": 3.53,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SaveTheBestForLast.png"
      },
      {
        "name": "Huntress",
        "perk_name": "Beast of Prey",
        "description": "Your lust for a kill is so intense that your connection with The Entity is momentarily lost, making you totally unpredictable. The Red Stain disappears after gaining Bloodlust Tier I and stays hidden until you lose Bloodlust. Gain 50 % more Bloodpoints for actions in the Hunter Category.",
        "rating": 2.44,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BeastOfPrey.png"
      },
      {
        "name": "Cannibal",
        "perk_name": "Barbecue & Chilli",
        "description": "A deep bond with The Entity unlocks potential in one's Aura-reading ability. After hooking a Survivor, all other Survivors' Auras are revealed to you for 4 seconds when they are farther than 40 metres from the Hook. Each time a Survivor is hooked for the first time, gain a 25 % stack-able bonus to all Bloodpoint gains up to a maximum of 100 %. The bonus Bloodpoints are only awarded post-Trial.",
        "rating": 4.59,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BarbecueChilli.png"
      },
      {
        "name": "Plague",
        "perk_name": "Corrupt Intervention",
        "description": "Your prayers invoke a dark power that meddles with the Survivors' chances of survival. 3 Generators located farthest from you are blocked by The Entity for 120 seconds at the start of the Trial. Survivors cannot repair the Generators for the duration Corrupt Intervention is active.",
        "rating": 4,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_CorruptIntervention.png"
      },
      {
        "name": "Plague",
        "perk_name": "Dark Devotion",
        "description": "The display of your Powers creates a whirlwind of panic that spreads throughout the land. You become obsessed with one Survivor. Hitting the Obsession with your basic attack causes the Obsession to emit a Terror Radius of 32 metres for 30 seconds. During that time, your Terror Radius is reduced to 0 metres. The Obsession hears the Terror Radius they emit for the duration. You can only be obsessed with one Survivor at a time.",
        "rating": 3.36,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DarkDevotion.png"
      },
      {
        "name": "Demogorgon",
        "perk_name": "Surge",
        "description": "Your eerie presence charges the air and interferes with technology. Putting a Survivor into the Dying State with a Basic Attack causes all Generators within a radius of 32 metres to instantly explode and regress. Surge applies an immediate Regression penalty of 8 %. Surge can only be triggered once every 40 seconds.",
        "rating": 4.41,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Surge.png"
      },
      {
        "name": "Oni",
        "perk_name": "Blood Echo",
        "description": "The agony of one is inflicted on others. When hooking a Survivor, all other injured Survivors suffer from the Haemorrhage Status Effect until healed and the Exhausted Status Effect for 45 seconds. Blood Echo can only be triggered once every 60 seconds.",
        "rating": 3.24,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_BloodEcho.png"
      },
      {
        "name": "Basic",
        "perk_name": "Insidious",
        "description": "Unlocks the stealth ability. By standing still for 2 seconds, you reduce your Terror Radius to 0 metres and thus become stealthy until you move or act again.",
        "rating": 2.24,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Insidious.png"
      },
      {
        "name": "Basic",
        "perk_name": "Sloppy Butcher",
        "description": "You know where to hit to make them bleed. Wounds inflicted by successful attacks considerably increase the Survivor's bleeding frequency and cause the Mangled Status  Haemorrhage and Mangled effects caused by Sloppy Butcher return to normal once the Survivor is fully healed.",
        "rating": 3.3,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_SloppyButcher.png"
      },
      {
        "name": "Pyramid Head",
        "perk_name": "Forced Penance",
        "description": "Those who stand in the way of duty will suffer harsh judgement. Survivors who take a Protection Hit are inflicted with the Broken Status Effect for 60/70/80 seconds.",
        "rating": 2.79,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_ForcedPenance.png"
      },
      {
        "name": "Pyramid Head",
        "perk_name": "Deathbound",
        "description": "Those whose lives are intertwined in darkness are destined to suffer together. When a Survivor heals another Survivor for one Health State at least 32 metres away from the Killer, the Survivor performing the Healing action will scream, revealing their location and activating Deathbound for the next 60 seconds. During that time, the Survivor will suffer from the Oblivious Status Effect when farther than 16/12/8 metres away from the healed Survivor.",
        "rating": 3.07,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Deathbound.png"
      },
      {
        "name": "Blight",
        "perk_name": "Hex: Undying",
        "description": "A Hex which maintains the vile powers that flow throughout the Trial. When Hex: Undying is active and a different Hex Totem is cleansed, that Hex will be transferred to a Dull Totem—so long as one exists. Survivors' Auras are revealed for 4/5/6 seconds when they are within 2 metres of any Totem.",
        "rating": 4.14,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_HexUndying.png"
      },
      {
        "name": "Freddy",
        "perk_name": "Remember Me",
        "description": "You become obsessed with one Survivor. Each time you hit your Obsession, you increase the Exit Gate Opening time by 4 seconds up to a maximum of 16 additional seconds. The Obsession is not affected by Remember Me. You can only be obsessed with one Survivor at a time.",
        "rating": 3.96,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_RememberMe.png"
      },
      {
        "name": "Deathslinger",
        "perk_name": "Hex: Retribution",
        "description": "A Hex that lashes out upon its destruction. Those who cross you will be punished. Any Survivor who cleanses a Dull Totem will suffer from the Oblivious Status Effect for 35/40/45 seconds. If any Hex Totem is cleansed, including this one, the Auras of all Survivors are revealed for 10 seconds.",
        "rating": 3.48,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_HexRetribution.png"
      },
      {
        "name": "Clown",
        "perk_name": "Coulrophobia",
        "description": "Your presence alone instils great fear. Survivors within your Terror Radius have a 50 % penalty to the Healing progression speed.",
        "rating": 2.89,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Coulrophobia.png"
      },
      {
        "name": "Basic",
        "perk_name": "Distressing",
        "description": "Your horrifying emanation strikes at a supernaturally long distance. Your Terror Radius is increased by 26 %. Gain 100 % more Bloodpoints for actions in the Deviousness Category. The Bonus Bloodpoints are only awarded during the Trial.",
        "rating": 3.12,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Distressing.png"
      },
      {
        "name": "Ghost Face",
        "perk_name": "Furtive Chase",
        "description": "You become obsessed with one Survivor. You lurk in the shadows, eliminating your victims one by one. When your Obsession is hooked, Furtive Chase receives a Token, up to a maximum of 4 Tokens. Each Token decreases your Terror Radius by 4 metres while in a Chase. When a Survivor rescues the Obsession from a Hook, the rescuer becomes the Obsession. You lose all Tokens if the Obsession is sacrificed or killed. You can only be obsessed with one Survivor at a time.",
        "rating": 2.33,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_FurtiveChase.png"
      },
      {
        "name": "Ghost Face",
        "perk_name": "Thrilling Tremors",
        "description": "Your dark designs and shrewd composure rouse The Entity. After picking up a Survivor, all Generators not being repaired by Survivors are blocked by The Entity and cannot be repaired for the next 16 seconds. Affected Generators are highlighted by a white Aura. Thrilling Tremors can only be triggered once every 60 seconds.",
        "rating": 3.64,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_ThrillingTremors.png"
      },
      {
        "name": "Deathslinger",
        "perk_name": "Dead Man's Switch",
        "description": "You become obsessed with one Survivor. After hooking the Obsession, Dead Man's Switch activates for the next 35/40/45 seconds. While activated, any Survivor that stops repairing a Generator before it is fully repaired causes The Entity to block the Generator until Dead Man's Switch's effect ends. Affected Generators are highlighted by a white Aura.",
        "rating": 3.32,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DeadMansSwitch.png"
      },
      {
        "name": "Basic",
        "perk_name": "Hex: Thrill of the Hunt",
        "description": "A Hex rooting its power on hope. The false hope of Survivors fills you with excitement and strengthens your totems. For each Dull Totem and Hex Totem remaining on the Map gain a Token. • Gain 10 % more Bloodpoints for actions in the Hunter Category for each Token. • Survivors' cleansing speed is reduced by 6 % for each Token. • Gain a notification when someone starts working on a Hex Totem. The Hex effects persist as long as the related Hex Totem is standing.",
        "rating": 3.07,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_ThrillOfTheHunt.png"
      },
      {
        "name": "Blight",
        "perk_name": "Hex: Blood Favour",
        "description": "A Hex that gains the favour of The Entity when blood is spilt. When a Survivor is hit, all Pallets within a radius of 16 metres of your location are held in place by The Entity for 15 seconds and cannot be pulled down by Survivors. Hex: Blood Favour has a cool-down of 60/50/40 seconds.",
        "rating": 3.24,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_HexBloodFavour.png"
      },
      {
        "name": "Nurse",
        "perk_name": "Stridor",
        "description": "You are acutely sensitive to the breathing of your prey. Survivors' Grunts of Pain are 50 % louder and regular breathing is 25 % louder.",
        "rating": 3.62,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Stridor.png"
      },
      {
        "name": "Myers",
        "perk_name": "Dying Light",
        "description": "You become obsessed with one Survivor. Your Obsession gains a 33 % Action Speed bonus to unhooking and healing other Survivors. Each time you hook a Survivor that is not the Obsession and the Obsession is alive, gain a Token. If the Obsession is alive, all others Survivors get a stack-able 3 % penalty to Repair, Healing, and Sabotage speed for each Token. You can only be obsessed with one Survivor at a time.",
        "rating": 3.17,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_DyingLight.png"
      },
      {
        "name": "Hag",
        "perk_name": "Hex: Ruin",
        "description": "A Hex that affects the Survivors' skills at repairing Generators. All Survivors are affected by Ruin, which causes the following: • Good Skill Checks result in a 5 % Regression penalty on the Generator. • Great Skill Checks grant 0 % Bonus Progression on the Generator. The Hex effects persist as long as the related Hex Totem is standing.",
        "rating": 4.53,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Ruin.png"
      },
      {
        "name": "Clown",
        "perk_name": "Pop Goes the Weasel",
        "description": "A deep bond with The Entity unlocks great strength. After hooking a Survivor, the next Generator you damage is instantly loses 25% of its progress. Normal Generator Regression applies after the Damage Generator action. Pop Goes the Weasel is active for 35/40/45 seconds after the Survivor is hooked.",
        "rating": 4.56,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_PopGoesTheWeasel.png"
      },
      {
        "name": "Oni",
        "perk_name": "Zanshin Tactics",
        "description": "Unlocks potential in one's Aura-reading ability. You are mentally alert and aware of key points on the battlefield. The Auras of all Pallets and Windows are revealed to you within a range of 24 metres. When a Survivor is damaged, Zanshin Tactics becomes inactive for 30 seconds.",
        "rating": 2.9,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_ZanshinTactics.png"
      },
      {
        "name": "Basic",
        "perk_name": "Monstrous Shrine",
        "description": "Your fervent care of the Hooks found in the Basement has aroused The Entity's interest. The Basement Hooks are granted the following bonuses: • 9 % faster Entity progression • 15 % increased difficulty on escape attempts • 9 % increased penalty to escape fails.",
        "rating": 1.73,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_MonstrousShrine.png"
      },
      {
        "name": "Clown",
        "perk_name": "Bamboozle",
        "description": "Your vault speed is 15 % faster. Performing a vault action calls upon The Entity to block that vault location for 16 seconds. Only one vault location may be blocked in this way at any given time. The vault location is blocked only for Survivors. Bamboozle does not affect Pallets.",
        "rating": 4.12,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Bamboozle.png"
      },
      {
        "name": "Basic",
        "perk_name": "Whispers",
        "description": "You have a rudimentary understanding of The Entity's voice. Sporadically hear The Entity's Whisper when standing within a 32 metres of a Survivor.",
        "rating": 4.04,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Whispers.png"
      },
      {
        "name": "Twins",
        "perk_name": "Hoarder",
        "description": "You protect what little you have and are perceptive to those rummaging through your stockpiles. Receive a Loud Noise notification for 4 seconds when Survivors interact with a Chest or when they pick up an Item within 24/36/48 meters of your location. The Trial begins with up to 2 additional Chests in the environment. The rarity of Items found in all Chests is decreased.",
        "rating": 2.85,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Hoarder.png"
      },
      {
        "name": "Twins",
        "perk_name": "Oppression",
        "description": "Life has been difficult for you, so you'll make it difficult for others. When you damage a Generator, up to 3 other random Generators also begin regressing. If the affected Generators are being repaired, any Survivors repairing them receive a difficult Skill Check. Oppression has a cool-down of 120/100/80 seconds.",
        "rating": 4.35,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Oppression.png"
      },
      {
        "name": "Twins",
        "perk_name": "Coup de Grace",
        "description": "As the end nears, you go in for the kill. Each time a Generator is completed, Coup de Grâce grows in power. Gain 1 Token per Generator. Consume 1 Token to increase the distance of your next Lunge Attack by 60/80/100 %.",
        "rating": 3.32,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_CoupDeGrace.png"
      },
      {
        "name": "Trickster",
        "perk_name": "No Way Out",
        "description": "You are not going to let just anyone into the VIP room. For each of the Survivors you manage to hook, No Way Out gains 1 Token: When the last Generator is completed, The Entity blocks both Exit Gate Switches for 10 seconds and an additional 4/6/8 seconds per Token in your possession, up to a combined maximum of 26/34/42 seconds.",
        "rating": 3.67,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_NoWayOut.png"
      },
      {
        "name": "Trickster",
        "perk_name": "Hex: Crowd Control",
        "description": "A Hex that ensures those lesser than you are properly herded. Survivors who perform a rushed vault through a Window prompt The Entity to block it for the next 10/12/14 seconds. The Hex effects persist as long as the related Hex Totem is standing.",
        "rating": 3.57,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_HexCrowdControl.png"
      },
      {
        "name": "Trickster",
        "perk_name": "Starstruck",
        "description": "Your unmatched showmanship dazzles all. When carrying a Survivor, Starstruck activates: Survivors suffer from the Exposed Status Effect while in your Terror Radius. The Status Effect lingers for 26/28/30 seconds after leaving your Terror Radius. After hooking or dropping the carried Survivor, Starstruck deactivates: The Status Effect persists for 26/28/30 seconds for any Survivor inside your Terror Radius at that moment. Starstruck has a cool-down of 60 seconds once the Survivor is no longer being carried.",
        "rating": 3.57,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Starstruck.png"
      },
      {
        "name": "Nemesis",
        "perk_name": "Lethal Pursuer",
        "description": "You have been designed to track down and eliminate targets. At the start of the Trial, the Auras of all Survivors are revealed to you for 7/8/9 seconds.",
        "rating": 3.92,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_LethalPursuer.png"
      },
      {
        "name": "Nemesis",
        "perk_name": "Eruption",
        "description": "The NE-α parasite provides you with the intelligence and awareness needed to set a trap. After kicking a Generator , its Aura is highlighted in yellow. When you put a Survivor into the Dying State , every affected Generator explodes, regressing their progress by 6 % and causing their Auras to disappear. Any Survivor repairing a Generator when it explodes will scream and suffer from the Incapacitated Status Effect for 12/14/16 seconds. Eruption has a cool-down of 30 seconds",
        "rating": 3.85,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Eruption.png"
      },
      {
        "name": "Nemesis",
        "perk_name": "Hysteria",
        "description": "You know how to brutalise one member of a team to cause a panic. Whenever you put a healthy Survivor into the Injured State , all injured Survivors suffer from the Oblivious Status Effect for 20/25/30 seconds. Hysteria has a cool-down of 30 seconds. ",
        "rating": 2.33,
        "icon_url": "https://github.com/upsetdog/dbd-assets/raw/main/icons/iconPerks_Hysteria.png"
      },
      {
        "name": "Pinhead",
        "perk_name": "Deadlock",
        "description": "You induce mental suffering by crushing any hope of escape. Whenever a Generator is completed, The Entity blocks the Generator with the most progression for 20/25/30 seconds. The Aura of the blocked Generator is revealed to you in white during this time.",
        "rating": 4.32,
        "icon_url": "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/5/56/Deadlock.gif/revision/latest/scale-to-width-down/128?cb=20210819114604"
      },
      {
        "name": "Pinhead",
        "perk_name": "Hex: Plaything",
        "description": "If there is at least one Dull Totem remaining in the Trial Grounds, Hex: Plaything activates on a random Totem each time a Survivor is hooked for the first time:\nThe Survivors suffers from the Cursed and Oblivious Status Effects until Hex: Plaything is cleansed. For the first 90 seconds, only the Cursed Survivor is able to cleanse the Hex Totem. The Aura of Hex: Plaything's Hex Totem is revealed to the Cursed Survivor within 24/20/16 metres. The Hex effects persist as long as the related Hex Totem is standing. ",
        "rating": 3.33,
        "icon_url": "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/d/d5/HexPlaything.gif/revision/latest/scale-to-width-down/128?cb=20210819114606"
      },
      {
        "name": "Pinhead",
        "perk_name": "Scourge Hook: Gift of Pain",
        "description": "At the start of the Trial, 4 random Hooks are changed into Scourge Hooks:\nThe Auras of Scourge Hooks are revealed to you in white. When a Survivor is unhooked from a Scourge Hook they suffer from the Haemorrhage and Mangled Status Effects. Both Status Effects are removed upon being healed. Upon being healed, the Survivor suffers from a 7/8/9% Healing and Repairing Action Speed penalty until they are injured again.",
        "rating": 4,
        "icon_url": "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/8/86/ScourgeHookGiftOfPain.gif/revision/latest/scale-to-width-down/128?cb=20210819114606"
      }
    ];

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function expoInOut(t) {
        return t === 0.0 || t === 1.0
            ? t
            : t < 0.5
                ? +0.5 * Math.pow(2.0, 20.0 * t - 10.0)
                : -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0;
    }

    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src\components\Book.svelte generated by Svelte v3.43.2 */
    const file$c = "src\\components\\Book.svelte";

    function create_fragment$d(ctx) {
    	let div6;
    	let div5;
    	let div2;
    	let div0;
    	let h2;
    	let t0;
    	let t1;
    	let div1;
    	let h3;
    	let t2;
    	let t3;
    	let div4;
    	let div3;
    	let p;
    	let t4;
    	let t5;
    	let img;
    	let img_src_value;
    	let div5_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text(/*perk_name*/ ctx[1]);
    			t1 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t2 = text(/*name*/ ctx[0]);
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			p = element("p");
    			t4 = text(/*description*/ ctx[2]);
    			t5 = space();
    			img = element("img");
    			attr_dev(h2, "class", "svelte-1h09r8h");
    			add_location(h2, file$c, 16, 3, 363);
    			attr_dev(div0, "class", "perkname");
    			add_location(div0, file$c, 15, 2, 336);
    			attr_dev(h3, "class", "svelte-1h09r8h");
    			add_location(h3, file$c, 20, 24, 426);
    			attr_dev(div1, "class", "survname");
    			add_location(div1, file$c, 20, 2, 404);
    			attr_dev(div2, "class", "perkheader svelte-1h09r8h");
    			add_location(div2, file$c, 13, 1, 306);
    			attr_dev(p, "class", "svelte-1h09r8h");
    			add_location(p, file$c, 24, 27, 512);
    			attr_dev(div3, "class", "description svelte-1h09r8h");
    			add_location(div3, file$c, 24, 2, 487);
    			if (!src_url_equal(img.src, img_src_value = /*icon_url*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*icon_url*/ ctx[3]);
    			attr_dev(img, "class", "svelte-1h09r8h");
    			add_location(img, file$c, 25, 2, 542);
    			attr_dev(div4, "class", "perkmain svelte-1h09r8h");
    			add_location(div4, file$c, 23, 1, 461);
    			attr_dev(div5, "class", "perk svelte-1h09r8h");
    			add_location(div5, file$c, 9, 0, 224);
    			attr_dev(div6, "class", "perkbox svelte-1h09r8h");
    			add_location(div6, file$c, 8, 0, 201);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t4);
    			append_dev(div4, t5);
    			append_dev(div4, img);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*perk_name*/ 2) set_data_dev(t0, /*perk_name*/ ctx[1]);
    			if (!current || dirty & /*name*/ 1) set_data_dev(t2, /*name*/ ctx[0]);
    			if (!current || dirty & /*description*/ 4) set_data_dev(t4, /*description*/ ctx[2]);

    			if (!current || dirty & /*icon_url*/ 8 && !src_url_equal(img.src, img_src_value = /*icon_url*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*icon_url*/ 8) {
    				attr_dev(img, "alt", /*icon_url*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div5_transition) div5_transition = create_bidirectional_transition(div5, scale, { duration: 500, easing: expoInOut }, true);
    				div5_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div5_transition) div5_transition = create_bidirectional_transition(div5, scale, { duration: 500, easing: expoInOut }, false);
    			div5_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (detaching && div5_transition) div5_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Book', slots, []);
    	let { name } = $$props;
    	let { perk_name } = $$props;
    	let { description } = $$props;
    	let { icon_url } = $$props;
    	const writable_props = ['name', 'perk_name', 'description', 'icon_url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Book> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('perk_name' in $$props) $$invalidate(1, perk_name = $$props.perk_name);
    		if ('description' in $$props) $$invalidate(2, description = $$props.description);
    		if ('icon_url' in $$props) $$invalidate(3, icon_url = $$props.icon_url);
    	};

    	$$self.$capture_state = () => ({
    		scale,
    		expoInOut,
    		name,
    		perk_name,
    		description,
    		icon_url
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('perk_name' in $$props) $$invalidate(1, perk_name = $$props.perk_name);
    		if ('description' in $$props) $$invalidate(2, description = $$props.description);
    		if ('icon_url' in $$props) $$invalidate(3, icon_url = $$props.icon_url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, perk_name, description, icon_url];
    }

    class Book extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			name: 0,
    			perk_name: 1,
    			description: 2,
    			icon_url: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Book",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<Book> was created without expected prop 'name'");
    		}

    		if (/*perk_name*/ ctx[1] === undefined && !('perk_name' in props)) {
    			console.warn("<Book> was created without expected prop 'perk_name'");
    		}

    		if (/*description*/ ctx[2] === undefined && !('description' in props)) {
    			console.warn("<Book> was created without expected prop 'description'");
    		}

    		if (/*icon_url*/ ctx[3] === undefined && !('icon_url' in props)) {
    			console.warn("<Book> was created without expected prop 'icon_url'");
    		}
    	}

    	get name() {
    		throw new Error("<Book>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Book>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get perk_name() {
    		throw new Error("<Book>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set perk_name(value) {
    		throw new Error("<Book>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Book>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Book>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon_url() {
    		throw new Error("<Book>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon_url(value) {
    		throw new Error("<Book>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Menu.svelte generated by Svelte v3.43.2 */

    const file$b = "src\\components\\Menu.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (11:8) {#each names as name}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*name*/ ctx[3] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*name*/ ctx[3];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-mmcd9b");
    			add_location(option, file$b, 11, 8, 329);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*names*/ 2 && t_value !== (t_value = /*name*/ ctx[3] + "")) set_data_dev(t, t_value);

    			if (dirty & /*names*/ 2 && option_value_value !== (option_value_value = /*name*/ ctx[3])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:8) {#each names as name}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let section;
    	let select;
    	let option0;
    	let option1;
    	let mounted;
    	let dispose;
    	let each_value = /*names*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Select";
    			option1 = element("option");
    			option1.textContent = "All perks";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option0.disabled = true;
    			option0.selected = true;
    			option0.__value = "";
    			option0.value = option0.__value;
    			attr_dev(option0, "class", "svelte-mmcd9b");
    			add_location(option0, file$b, 7, 8, 188);
    			option1.__value = "All";
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-mmcd9b");
    			add_location(option1, file$b, 8, 8, 248);
    			attr_dev(select, "class", "menu svelte-mmcd9b");
    			attr_dev(select, "name", "menu");
    			attr_dev(select, "id", "menu");
    			if (/*selectedName*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$b, 6, 4, 109);
    			attr_dev(section, "class", "menu-cont");
    			add_location(section, file$b, 5, 0, 76);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, select);
    			append_dev(select, option0);
    			append_dev(select, option1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedName*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*names*/ 2) {
    				each_value = /*names*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selectedName, names*/ 3) {
    				select_option(select, /*selectedName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	let { selectedName } = $$props;
    	let { names } = $$props;
    	const writable_props = ['selectedName', 'names'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selectedName = select_value(this);
    		$$invalidate(0, selectedName);
    		$$invalidate(1, names);
    	}

    	$$self.$$set = $$props => {
    		if ('selectedName' in $$props) $$invalidate(0, selectedName = $$props.selectedName);
    		if ('names' in $$props) $$invalidate(1, names = $$props.names);
    	};

    	$$self.$capture_state = () => ({ selectedName, names });

    	$$self.$inject_state = $$props => {
    		if ('selectedName' in $$props) $$invalidate(0, selectedName = $$props.selectedName);
    		if ('names' in $$props) $$invalidate(1, names = $$props.names);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedName, names, select_change_handler];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { selectedName: 0, names: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedName*/ ctx[0] === undefined && !('selectedName' in props)) {
    			console.warn("<Menu> was created without expected prop 'selectedName'");
    		}

    		if (/*names*/ ctx[1] === undefined && !('names' in props)) {
    			console.warn("<Menu> was created without expected prop 'names'");
    		}
    	}

    	get selectedName() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedName(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get names() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set names(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Search.svelte generated by Svelte v3.43.2 */

    const file$a = "src\\components\\Search.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "search-field");
    			attr_dev(input, "placeholder", "Type");
    			attr_dev(input, "autocomplete", "off");
    			attr_dev(input, "class", "svelte-lm5d8a");
    			add_location(input, file$a, 7, 4, 81);
    			attr_dev(div, "class", "search");
    			add_location(div, file$a, 5, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*searchTerm*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(input, "input", /*input_handler*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*searchTerm*/ 1 && input.value !== /*searchTerm*/ ctx[0]) {
    				set_input_value(input, /*searchTerm*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Search', slots, []);
    	let { searchTerm } = $$props;
    	const writable_props = ['searchTerm'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_input_handler() {
    		searchTerm = this.value;
    		$$invalidate(0, searchTerm);
    	}

    	$$self.$$set = $$props => {
    		if ('searchTerm' in $$props) $$invalidate(0, searchTerm = $$props.searchTerm);
    	};

    	$$self.$capture_state = () => ({ searchTerm });

    	$$self.$inject_state = $$props => {
    		if ('searchTerm' in $$props) $$invalidate(0, searchTerm = $$props.searchTerm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [searchTerm, input_handler, input_input_handler];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { searchTerm: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*searchTerm*/ ctx[0] === undefined && !('searchTerm' in props)) {
    			console.warn("<Search> was created without expected prop 'searchTerm'");
    		}
    	}

    	get searchTerm() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchTerm(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Logo.svelte generated by Svelte v3.43.2 */

    const file$9 = "src\\components\\Logo.svelte";

    function create_fragment$a(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = `${/*setTitle*/ ctx[0]}`;
    			attr_dev(h1, "class", "svelte-1sae7fv");
    			add_location(h1, file$9, 5, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Logo', slots, []);
    	let setTitle = "Perks";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Logo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ setTitle });

    	$$self.$inject_state = $$props => {
    		if ('setTitle' in $$props) $$invalidate(0, setTitle = $$props.setTitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [setTitle];
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logo",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\Or.svelte generated by Svelte v3.43.2 */

    const file$8 = "src\\components\\Or.svelte";

    function create_fragment$9(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "or";
    			attr_dev(p, "class", "svelte-1ma0763");
    			add_location(p, file$8, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Or', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Or> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Or extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Or",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\Info.svelte generated by Svelte v3.43.2 */

    const file$7 = "src\\components\\Info.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Select character or type...";
    			attr_dev(p, "class", "svelte-cy2hb2");
    			add_location(p, file$7, 2, 0, 48);
    			attr_dev(div, "class", "infocontainer svelte-cy2hb2");
    			add_location(div, file$7, 1, 0, 19);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Info', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\Error.svelte generated by Svelte v3.43.2 */

    const { Error: Error_1$1 } = globals;
    const file$6 = "src\\components\\Error.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let h2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "not found =(";
    			attr_dev(h2, "class", "svelte-1xshhv6");
    			add_location(h2, file$6, 6, 4, 52);
    			attr_dev(div, "class", "error svelte-1xshhv6");
    			add_location(div, file$6, 5, 0, 27);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Error', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Home.svelte generated by Svelte v3.43.2 */

    const { Error: Error_1, console: console_1 } = globals;
    const file$5 = "src\\Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i].name;
    	child_ctx[10] = list[i].perk_name;
    	child_ctx[11] = list[i].description;
    	child_ctx[12] = list[i].icon_url;
    	return child_ctx;
    }

    // (87:52) 
    function create_if_block_2(ctx) {
    	let error;
    	let current;
    	error = new Error$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(87:52) ",
    		ctx
    	});

    	return block;
    }

    // (79:36) 
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*filteredBooks*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredBooks*/ 2) {
    				each_value = /*filteredBooks*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(79:36) ",
    		ctx
    	});

    	return block;
    }

    // (75:1) {#if  searchTerm.length === 0 && selectedName.length === 0}
    function create_if_block(ctx) {
    	let info;
    	let current;
    	info = new Info({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(info.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(info, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(info.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(info, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(75:1) {#if  searchTerm.length === 0 && selectedName.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (80:2) {#each filteredBooks as {name, perk_name, description, icon_url}}
    function create_each_block(ctx) {
    	let book;
    	let current;

    	book = new Book({
    			props: {
    				name: /*name*/ ctx[9],
    				perk_name: /*perk_name*/ ctx[10],
    				description: /*description*/ ctx[11],
    				icon_url: /*icon_url*/ ctx[12]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(book.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(book, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const book_changes = {};
    			if (dirty & /*filteredBooks*/ 2) book_changes.name = /*name*/ ctx[9];
    			if (dirty & /*filteredBooks*/ 2) book_changes.perk_name = /*perk_name*/ ctx[10];
    			if (dirty & /*filteredBooks*/ 2) book_changes.description = /*description*/ ctx[11];
    			if (dirty & /*filteredBooks*/ 2) book_changes.icon_url = /*icon_url*/ ctx[12];
    			book.$set(book_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(book.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(book.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(book, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(80:2) {#each filteredBooks as {name, perk_name, description, icon_url}}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let body;
    	let header;
    	let logo;
    	let t0;
    	let div;
    	let menu;
    	let updating_selectedName;
    	let t1;
    	let or;
    	let t2;
    	let search;
    	let updating_searchTerm;
    	let t3;
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	logo = new Logo({ $$inline: true });

    	function menu_selectedName_binding(value) {
    		/*menu_selectedName_binding*/ ctx[5](value);
    	}

    	let menu_props = { names: /*names*/ ctx[3] };

    	if (/*selectedName*/ ctx[0] !== void 0) {
    		menu_props.selectedName = /*selectedName*/ ctx[0];
    	}

    	menu = new Menu({ props: menu_props, $$inline: true });
    	binding_callbacks.push(() => bind(menu, 'selectedName', menu_selectedName_binding));
    	or = new Or({ $$inline: true });

    	function search_searchTerm_binding(value) {
    		/*search_searchTerm_binding*/ ctx[6](value);
    	}

    	let search_props = {};

    	if (/*searchTerm*/ ctx[2] !== void 0) {
    		search_props.searchTerm = /*searchTerm*/ ctx[2];
    	}

    	search = new Search({ props: search_props, $$inline: true });
    	binding_callbacks.push(() => bind(search, 'searchTerm', search_searchTerm_binding));
    	search.$on("input", /*searchPerks*/ ctx[4]);
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*searchTerm*/ ctx[2].length === 0 && /*selectedName*/ ctx[0].length === 0) return 0;
    		if (/*filteredBooks*/ ctx[1].length > 0) return 1;
    		if (/*searchTerm*/ ctx[2] && /*filteredBooks*/ ctx[1].length === 0) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			header = element("header");
    			create_component(logo.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(menu.$$.fragment);
    			t1 = space();
    			create_component(or.$$.fragment);
    			t2 = space();
    			create_component(search.$$.fragment);
    			t3 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			add_location(header, file$5, 62, 0, 1421);
    			attr_dev(div, "class", "navigation svelte-qgqsnl");
    			add_location(div, file$5, 66, 0, 1455);
    			attr_dev(main, "id", "bookshelf");
    			add_location(main, file$5, 72, 0, 1588);
    			attr_dev(body, "class", "animate__animated animate__fadeIn");
    			add_location(body, file$5, 60, 0, 1369);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, header);
    			mount_component(logo, header, null);
    			append_dev(body, t0);
    			append_dev(body, div);
    			mount_component(menu, div, null);
    			append_dev(div, t1);
    			mount_component(or, div, null);
    			append_dev(div, t2);
    			mount_component(search, div, null);
    			append_dev(body, t3);
    			append_dev(body, main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const menu_changes = {};
    			if (dirty & /*names*/ 8) menu_changes.names = /*names*/ ctx[3];

    			if (!updating_selectedName && dirty & /*selectedName*/ 1) {
    				updating_selectedName = true;
    				menu_changes.selectedName = /*selectedName*/ ctx[0];
    				add_flush_callback(() => updating_selectedName = false);
    			}

    			menu.$set(menu_changes);
    			const search_changes = {};

    			if (!updating_searchTerm && dirty & /*searchTerm*/ 4) {
    				updating_searchTerm = true;
    				search_changes.searchTerm = /*searchTerm*/ ctx[2];
    				add_flush_callback(() => updating_searchTerm = false);
    			}

    			search.$set(search_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			transition_in(menu.$$.fragment, local);
    			transition_in(or.$$.fragment, local);
    			transition_in(search.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(menu.$$.fragment, local);
    			transition_out(or.$$.fragment, local);
    			transition_out(search.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(logo);
    			destroy_component(menu);
    			destroy_component(or);
    			destroy_component(search);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let names = [];
    	let selectedName = "";

    	const getNames = () => {
    		for (let bookObj of bookData) {
    			if (!names.includes(bookObj.name)) {
    				$$invalidate(3, names = [...names, bookObj.name]);
    			}
    		}

    		$$invalidate(3, names = names.sort());
    	};

    	onMount(() => getNames());
    	let filteredBooks = [];

    	// For select menu
    	const getPerkByName = () => {
    		$$invalidate(2, searchTerm = "");

    		if (selectedName === 'All') {
    			return $$invalidate(1, filteredBooks = bookData);
    		}

    		return $$invalidate(1, filteredBooks = bookData.filter(bookObj => {
    			return bookObj.name === selectedName;
    		}));
    	};

    	// Search input
    	let searchTerm = "";

    	const searchPerks = () => {
    		return $$invalidate(1, filteredBooks = bookData.filter(bookObj => {
    			let bookTitleLower = bookObj.perk_name.toLowerCase();
    			return bookTitleLower.includes(searchTerm.toLowerCase());
    		}));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function menu_selectedName_binding(value) {
    		selectedName = value;
    		($$invalidate(0, selectedName), $$invalidate(2, searchTerm));
    	}

    	function search_searchTerm_binding(value) {
    		searchTerm = value;
    		$$invalidate(2, searchTerm);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		bookData,
    		Book,
    		Menu,
    		Search,
    		Logo,
    		Or,
    		Info,
    		Error: Error$1,
    		names,
    		selectedName,
    		getNames,
    		filteredBooks,
    		getPerkByName,
    		searchTerm,
    		searchPerks
    	});

    	$$self.$inject_state = $$props => {
    		if ('names' in $$props) $$invalidate(3, names = $$props.names);
    		if ('selectedName' in $$props) $$invalidate(0, selectedName = $$props.selectedName);
    		if ('filteredBooks' in $$props) $$invalidate(1, filteredBooks = $$props.filteredBooks);
    		if ('searchTerm' in $$props) $$invalidate(2, searchTerm = $$props.searchTerm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*searchTerm*/ 4) {
    			if (searchTerm) $$invalidate(0, selectedName = "");
    		}

    		if ($$self.$$.dirty & /*selectedName*/ 1) {
    			if (selectedName) getPerkByName();
    		}

    		if ($$self.$$.dirty & /*selectedName, filteredBooks*/ 3) {
    			console.log(selectedName, filteredBooks);
    		}

    		if ($$self.$$.dirty & /*searchTerm*/ 4) {
    			console.log(searchTerm);
    		}
    	};

    	return [
    		selectedName,
    		filteredBooks,
    		searchTerm,
    		names,
    		searchPerks,
    		menu_selectedName_binding,
    		search_searchTerm_binding
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\Reporter.svelte generated by Svelte v3.43.2 */

    const file$4 = "src\\components\\Reporter.svelte";

    function create_fragment$5(ctx) {
    	let h2;
    	let t1;
    	let div2;
    	let p;
    	let t2;
    	let br;
    	let t3;
    	let t4;
    	let form;
    	let div0;
    	let label0;
    	let t6;
    	let input0;
    	let t7;
    	let label1;
    	let t9;
    	let input1;
    	let t10;
    	let div1;
    	let label2;
    	let t12;
    	let input2;
    	let t13;
    	let input3;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Reports aren't working right now.";
    			t1 = space();
    			div2 = element("div");
    			p = element("p");
    			t2 = text("If u find bugs like missing image, any other visual");
    			br = element("br");
    			t3 = text(" \r\n    or function bug, describe your problem here:");
    			t4 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Username";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			label1 = element("label");
    			label1.textContent = "E-mail";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			div1 = element("div");
    			label2 = element("label");
    			label2.textContent = "Describe your problem:";
    			t12 = space();
    			input2 = element("input");
    			t13 = space();
    			input3 = element("input");
    			attr_dev(h2, "class", "notworking svelte-13dyvp9");
    			add_location(h2, file$4, 4, 4, 29);
    			add_location(br, file$4, 8, 58, 185);
    			attr_dev(p, "class", "svelte-13dyvp9");
    			add_location(p, file$4, 8, 4, 131);
    			attr_dev(label0, "for", "Username");
    			attr_dev(label0, "class", "svelte-13dyvp9");
    			add_location(label0, file$4, 14, 12, 342);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "username");
    			attr_dev(input0, "name", "username");
    			input0.required = true;
    			attr_dev(input0, "class", "svelte-13dyvp9");
    			add_location(input0, file$4, 15, 12, 394);
    			attr_dev(label1, "class", "emailname svelte-13dyvp9");
    			attr_dev(label1, "for", "E-mail");
    			add_location(label1, file$4, 17, 12, 468);
    			attr_dev(input1, "class", "email svelte-13dyvp9");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "name", "email");
    			input1.required = true;
    			add_location(input1, file$4, 18, 12, 534);
    			attr_dev(div0, "class", "name svelte-13dyvp9");
    			add_location(div0, file$4, 13, 8, 310);
    			attr_dev(label2, "for", "Bug");
    			attr_dev(label2, "class", "svelte-13dyvp9");
    			add_location(label2, file$4, 22, 12, 663);
    			attr_dev(input2, "class", "bug svelte-13dyvp9");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "bug");
    			attr_dev(input2, "name", "bug");
    			input2.required = true;
    			add_location(input2, file$4, 23, 12, 724);
    			attr_dev(div1, "class", "problem svelte-13dyvp9");
    			add_location(div1, file$4, 21, 8, 628);
    			attr_dev(input3, "type", "submit");
    			input3.value = "Submit";
    			attr_dev(input3, "method", "post");
    			attr_dev(input3, "class", "svelte-13dyvp9");
    			add_location(input3, file$4, 25, 12, 814);
    			attr_dev(form, "action", "");
    			attr_dev(form, "name", "reporter");
    			attr_dev(form, "type", "submit");
    			attr_dev(form, "class", "svelte-13dyvp9");
    			add_location(form, file$4, 11, 4, 252);
    			attr_dev(div2, "class", "reportcontainer svelte-13dyvp9");
    			add_location(div2, file$4, 6, 0, 94);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p);
    			append_dev(p, t2);
    			append_dev(p, br);
    			append_dev(p, t3);
    			append_dev(div2, t4);
    			append_dev(div2, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t6);
    			append_dev(div0, input0);
    			append_dev(div0, t7);
    			append_dev(div0, label1);
    			append_dev(div0, t9);
    			append_dev(div0, input1);
    			append_dev(form, t10);
    			append_dev(form, div1);
    			append_dev(div1, label2);
    			append_dev(div1, t12);
    			append_dev(div1, input2);
    			append_dev(form, t13);
    			append_dev(form, input3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Reporter', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Reporter> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Reporter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reporter",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Reports.svelte generated by Svelte v3.43.2 */
    const file$3 = "src\\Reports.svelte";

    function create_fragment$4(ctx) {
    	let body;
    	let header;
    	let logo;
    	let t;
    	let main;
    	let reporter;
    	let current;
    	logo = new Logo({ $$inline: true });
    	reporter = new Reporter({ $$inline: true });

    	const block = {
    		c: function create() {
    			body = element("body");
    			header = element("header");
    			create_component(logo.$$.fragment);
    			t = space();
    			main = element("main");
    			create_component(reporter.$$.fragment);
    			attr_dev(header, "class", "svelte-1n4voz3");
    			add_location(header, file$3, 7, 0, 185);
    			add_location(main, file$3, 12, 0, 224);
    			attr_dev(body, "class", "animate__animated animate__fadeIn");
    			add_location(body, file$3, 5, 0, 133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, header);
    			mount_component(logo, header, null);
    			append_dev(body, t);
    			append_dev(body, main);
    			mount_component(reporter, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			transition_in(reporter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(reporter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(logo);
    			destroy_component(reporter);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Reports', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Reports> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Logo, Reporter });
    	return [];
    }

    class Reports extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reports",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Navig.svelte generated by Svelte v3.43.2 */

    const file$2 = "src\\components\\Navig.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let nav;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let a2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Bug Reports";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "About";
    			attr_dev(a0, "href", "/#/");
    			attr_dev(a0, "class", "svelte-18pzf9b");
    			add_location(a0, file$2, 6, 2, 65);
    			attr_dev(a1, "href", "#/reports");
    			attr_dev(a1, "class", "svelte-18pzf9b");
    			add_location(a1, file$2, 7, 2, 91);
    			attr_dev(a2, "href", "#/about");
    			attr_dev(a2, "class", "svelte-18pzf9b");
    			add_location(a2, file$2, 8, 2, 130);
    			attr_dev(nav, "class", "svelte-18pzf9b");
    			add_location(nav, file$2, 5, 1, 56);
    			attr_dev(div, "class", "nav-container svelte-18pzf9b");
    			add_location(div, file$2, 4, 0, 26);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    			append_dev(nav, t3);
    			append_dev(nav, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navig', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navig> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navig extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navig",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Aboutus.svelte generated by Svelte v3.43.2 */

    const file$1 = "src\\components\\Aboutus.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Me";
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			p = element("p");
    			p.textContent = "\"Život je lajf.\"";
    			attr_dev(h1, "class", "svelte-g2mz4e");
    			add_location(h1, file$1, 8, 4, 60);
    			if (!src_url_equal(img.src, img_src_value = "ja.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "#");
    			attr_dev(img, "class", "svelte-g2mz4e");
    			add_location(img, file$1, 9, 4, 79);
    			attr_dev(p, "class", "svelte-g2mz4e");
    			add_location(p, file$1, 10, 4, 111);
    			attr_dev(div, "class", "container svelte-g2mz4e");
    			add_location(div, file$1, 6, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, img);
    			append_dev(div, t2);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Aboutus', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Aboutus> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Aboutus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Aboutus",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\About.svelte generated by Svelte v3.43.2 */
    const file = "src\\About.svelte";

    function create_fragment$1(ctx) {
    	let body;
    	let header;
    	let logo;
    	let t;
    	let main;
    	let aboutus;
    	let current;
    	logo = new Logo({ $$inline: true });
    	aboutus = new Aboutus({ $$inline: true });

    	const block = {
    		c: function create() {
    			body = element("body");
    			header = element("header");
    			create_component(logo.$$.fragment);
    			t = space();
    			main = element("main");
    			create_component(aboutus.$$.fragment);
    			attr_dev(header, "class", "svelte-47uhir");
    			add_location(header, file, 7, 4, 185);
    			add_location(main, file, 11, 4, 238);
    			attr_dev(body, "class", "animate__animated animate__fadeIn");
    			add_location(body, file, 5, 0, 129);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, header);
    			mount_component(logo, header, null);
    			append_dev(body, t);
    			append_dev(body, main);
    			mount_component(aboutus, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			transition_in(aboutus.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(aboutus.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(logo);
    			destroy_component(aboutus);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Logo, Aboutus });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.43.2 */

    function create_fragment(ctx) {
    	let navig;
    	let t;
    	let router;
    	let current;
    	navig = new Navig({ $$inline: true });

    	router = new Router({
    			props: {
    				routes: {
    					'/': Home,
    					'/reports': Reports,
    					'/about': About
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navig.$$.fragment);
    			t = space();
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navig, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navig.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navig.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navig, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, Home, Report: Reports, Navig, About });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
