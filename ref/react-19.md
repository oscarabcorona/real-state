React 19 Upgrade Guide
April 25, 2024 by Ricky Hanlon

The improvements added to React 19 require some breaking changes, but we’ve worked to make the upgrade as smooth as possible, and we don’t expect the changes to impact most apps.

Nota
React 18.3 has also been published
To help make the upgrade to React 19 easier, we’ve published a react@18.3 release that is identical to 18.2 but adds warnings for deprecated APIs and other changes that are needed for React 19.

We recommend upgrading to React 18.3 first to help identify any issues before upgrading to React 19.

For a list of changes in 18.3 see the Release Notes.

In this post, we will guide you through the steps for upgrading to React 19:

Installing
Codemods
Breaking changes
New deprecations
Notable changes
TypeScript changes
Changelog
If you’d like to help us test React 19, follow the steps in this upgrade guide and report any issues you encounter. For a list of new features added to React 19, see the React 19 release post.

Installing
Nota
New JSX Transform is now required
We introduced a new JSX transform in 2020 to improve bundle size and use JSX without importing React. In React 19, we’re adding additional improvements like using ref as a prop and JSX speed improvements that require the new transform.

If the new transform is not enabled, you will see this warning:

Console
Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform
We expect most apps will not be affected since the transform is enabled in most environments already. For manual instructions on how to upgrade, please see the announcement post.

To install the latest version of React and React DOM:

npm install --save-exact react@^19.0.0 react-dom@^19.0.0
Or, if you’re using Yarn:

yarn add --exact react@^19.0.0 react-dom@^19.0.0
If you’re using TypeScript, you also need to update the types.

npm install --save-exact @types/react@^19.0.0 @types/react-dom@^19.0.0
Or, if you’re using Yarn:

yarn add --exact @types/react@^19.0.0 @types/react-dom@^19.0.0
We’re also including a codemod for the most common replacements. See TypeScript changes below.

Codemods
To help with the upgrade, we’ve worked with the team at codemod.com to publish codemods that will automatically update your code to many of the new APIs and patterns in React 19.

All codemods are available in the react-codemod repo and the Codemod team have joined in helping maintain the codemods. To run these codemods, we recommend using the codemod command instead of the react-codemod because it runs faster, handles more complex code migrations, and provides better support for TypeScript.

Nota
Run all React 19 codemods
Run all codemods listed in this guide with the React 19 codemod recipe:

npx codemod@latest react/19/migration-recipe
This will run the following codemods from react-codemod:

replace-reactdom-render
replace-string-ref
replace-act-import
replace-use-form-state
prop-types-typescript
This does not include the TypeScript changes. See TypeScript changes below.

Changes that include a codemod include the command below.

For a list of all available codemods, see the react-codemod repo.

Breaking changes
Errors in render are not re-thrown
In previous versions of React, errors thrown during render were caught and rethrown. In DEV, we would also log to console.error, resulting in duplicate error logs.

In React 19, we’ve improved how errors are handled to reduce duplication by not re-throwing:

Uncaught Errors: Errors that are not caught by an Error Boundary are reported to window.reportError.
Caught Errors: Errors that are caught by an Error Boundary are reported to console.error.
This change should not impact most apps, but if your production error reporting relies on errors being re-thrown, you may need to update your error handling. To support this, we’ve added new methods to createRoot and hydrateRoot for custom error handling:

const root = createRoot(container, {
onUncaughtError: (error, errorInfo) => {
// ... log error report
},
onCaughtError: (error, errorInfo) => {
// ... log error report
}
});
For more info, see the docs for createRoot and hydrateRoot.

Removed deprecated React APIs
Removed: propTypes and defaultProps for functions
PropTypes were deprecated in April 2017 (v15.5.0).

In React 19, we’re removing the propType checks from the React package, and using them will be silently ignored. If you’re using propTypes, we recommend migrating to TypeScript or another type-checking solution.

We’re also removing defaultProps from function components in place of ES6 default parameters. Class components will continue to support defaultProps since there is no ES6 alternative.

// Before
import PropTypes from 'prop-types';

function Heading({text}) {
return <h1>{text}</h1>;
}
Heading.propTypes = {
text: PropTypes.string,
};
Heading.defaultProps = {
text: 'Hello, world!',
};
// After
interface Props {
text?: string;
}
function Heading({text = 'Hello, world!'}: Props) {
return <h1>{text}</h1>;
}
Nota
Codemod propTypes to TypeScript with:

npx codemod@latest react/prop-types-typescript
Removed: Legacy Context using contextTypes and getChildContext
Legacy Context was deprecated in October 2018 (v16.6.0).

Legacy Context was only available in class components using the APIs contextTypes and getChildContext, and was replaced with contextType due to subtle bugs that were easy to miss. In React 19, we’re removing Legacy Context to make React slightly smaller and faster.

If you’re still using Legacy Context in class components, you’ll need to migrate to the new contextType API:

// Before
import PropTypes from 'prop-types';

class Parent extends React.Component {
static childContextTypes = {
foo: PropTypes.string.isRequired,
};

getChildContext() {
return { foo: 'bar' };
}

render() {
return <Child />;
}
}

class Child extends React.Component {
static contextTypes = {
foo: PropTypes.string.isRequired,
};

render() {
return <div>{this.context.foo}</div>;
}
}
// After
const FooContext = React.createContext();

class Parent extends React.Component {
render() {
return (
<FooContext value='bar'>
<Child />
</FooContext>
);
}
}

class Child extends React.Component {
static contextType = FooContext;

render() {
return <div>{this.context}</div>;
}
}
Removed: string refs
String refs were deprecated in March, 2018 (v16.3.0).

Class components supported string refs before being replaced by ref callbacks due to multiple downsides. In React 19, we’re removing string refs to make React simpler and easier to understand.

If you’re still using string refs in class components, you’ll need to migrate to ref callbacks:

// Before
class MyComponent extends React.Component {
componentDidMount() {
this.refs.input.focus();
}

render() {
return <input ref='input' />;
}
}
// After
class MyComponent extends React.Component {
componentDidMount() {
this.input.focus();
}

render() {
return <input ref={input => this.input = input} />;
}
}
Nota
Codemod string refs with ref callbacks:

npx codemod@latest react/19/replace-string-ref
Removed: Module pattern factories
Module pattern factories were deprecated in August 2019 (v16.9.0).

This pattern was rarely used and supporting it causes React to be slightly larger and slower than necessary. In React 19, we’re removing support for module pattern factories, and you’ll need to migrate to regular functions:

// Before
function FactoryComponent() {
return { render() { return <div />; } }
}
// After
function FactoryComponent() {
return <div />;
}
Removed: React.createFactory
createFactory was deprecated in February 2020 (v16.13.0).

Using createFactory was common before broad support for JSX, but it’s rarely used today and can be replaced with JSX. In React 19, we’re removing createFactory and you’ll need to migrate to JSX:

// Before
import { createFactory } from 'react';

const button = createFactory('button');
// After
const button = <button />;
Removed: react-test-renderer/shallow
In React 18, we updated react-test-renderer/shallow to re-export react-shallow-renderer. In React 19, we’re removing react-test-render/shallow to prefer installing the package directly:

npm install react-shallow-renderer --save-dev

- import ShallowRenderer from 'react-test-renderer/shallow';

* import ShallowRenderer from 'react-shallow-renderer';
  Nota
  Please reconsider shallow rendering
  Shallow rendering depends on React internals and can block you from future upgrades. We recommend migrating your tests to @testing-library/react or @testing-library/react-native.

Removed deprecated React DOM APIs
Removed: react-dom/test-utils
We’ve moved act from react-dom/test-utils to the react package:

Console
ReactDOMTestUtils.act is deprecated in favor of React.act. Import act from react instead of react-dom/test-utils. See https://react.dev/warnings/react-dom-test-utils for more info.
To fix this warning, you can import act from react:

- import {act} from 'react-dom/test-utils'

* import {act} from 'react';
  All other test-utils functions have been removed. These utilities were uncommon, and made it too easy to depend on low level implementation details of your components and React. In React 19, these functions will error when called and their exports will be removed in a future version.

See the warning page for alternatives.

Nota
Codemod ReactDOMTestUtils.act to React.act:

npx codemod@latest react/19/replace-act-import
Removed: ReactDOM.render
ReactDOM.render was deprecated in March 2022 (v18.0.0). In React 19, we’re removing ReactDOM.render and you’ll need to migrate to using ReactDOM.createRoot:

// Before
import {render} from 'react-dom';
render(<App />, document.getElementById('root'));

// After
import {createRoot} from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
Nota
Codemod ReactDOM.render to ReactDOMClient.createRoot:

npx codemod@latest react/19/replace-reactdom-render
Removed: ReactDOM.hydrate
ReactDOM.hydrate was deprecated in March 2022 (v18.0.0). In React 19, we’re removing ReactDOM.hydrate you’ll need to migrate to using ReactDOM.hydrateRoot,

// Before
import {hydrate} from 'react-dom';
hydrate(<App />, document.getElementById('root'));

// After
import {hydrateRoot} from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);
Nota
Codemod ReactDOM.hydrate to ReactDOMClient.hydrateRoot:

npx codemod@latest react/19/replace-reactdom-render
Removed: unmountComponentAtNode
ReactDOM.unmountComponentAtNode was deprecated in March 2022 (v18.0.0). In React 19, you’ll need to migrate to using root.unmount().

// Before
unmountComponentAtNode(document.getElementById('root'));

// After
root.unmount();
For more see root.unmount() for createRoot and hydrateRoot.

Nota
Codemod unmountComponentAtNode to root.unmount:

npx codemod@latest react/19/replace-reactdom-render
Removed: ReactDOM.findDOMNode
ReactDOM.findDOMNode was deprecated in October 2018 (v16.6.0).

We’re removing findDOMNode because it was a legacy escape hatch that was slow to execute, fragile to refactoring, only returned the first child, and broke abstraction levels (see more here). You can replace ReactDOM.findDOMNode with DOM refs:

// Before
import {findDOMNode} from 'react-dom';

function AutoselectingInput() {
useEffect(() => {
const input = findDOMNode(this);
input.select()
}, []);

return <input defaultValue="Hello" />;
}
// After
function AutoselectingInput() {
const ref = useRef(null);
useEffect(() => {
ref.current.select();
}, []);

return <input ref={ref} defaultValue="Hello" />
}
New deprecations
Deprecated: element.ref
React 19 supports ref as a prop, so we’re deprecating the element.ref in place of element.props.ref.

Accessing element.ref will warn:

Console
Accessing element.ref is no longer supported. ref is now a regular prop. It will be removed from the JSX Element type in a future release.
Deprecated: react-test-renderer
We are deprecating react-test-renderer because it implements its own renderer environment that doesn’t match the environment users use, promotes testing implementation details, and relies on introspection of React’s internals.

The test renderer was created before there were more viable testing strategies available like React Testing Library, and we now recommend using a modern testing library instead.

In React 19, react-test-renderer logs a deprecation warning, and has switched to concurrent rendering. We recommend migrating your tests to @testing-library/react or @testing-library/react-native for a modern and well supported testing experience.

Notable changes
StrictMode changes
React 19 includes several fixes and improvements to Strict Mode.

When double rendering in Strict Mode in development, useMemo and useCallback will reuse the memoized results from the first render during the second render. Components that are already Strict Mode compatible should not notice a difference in behavior.

As with all Strict Mode behaviors, these features are designed to proactively surface bugs in your components during development so you can fix them before they are shipped to production. For example, during development, Strict Mode will double-invoke ref callback functions on initial mount, to simulate what happens when a mounted component is replaced by a Suspense fallback.

Improvements to Suspense
In React 19, when a component suspends, React will immediately commit the fallback of the nearest Suspense boundary without waiting for the entire sibling tree to render. After the fallback commits, React schedules another render for the suspended siblings to “pre-warm” lazy requests in the rest of the tree:

Diagram showing a tree of three components, one parent labeled Accordion and two children labeled Panel. Both Panel components contain isActive with value false.
Previously, when a component suspended, the suspended siblings were rendered and then the fallback was committed.

The same diagram as the previous, with the isActive of the first child Panel component highlighted indicating a click with the isActive value set to true. The second Panel component still contains value false.
In React 19, when a component suspends, the fallback is committed and then the suspended siblings are rendered.

This change means Suspense fallbacks display faster, while still warming lazy requests in the suspended tree.

UMD builds removed
UMD was widely used in the past as a convenient way to load React without a build step. Now, there are modern alternatives for loading modules as scripts in HTML documents. Starting with React 19, React will no longer produce UMD builds to reduce the complexity of its testing and release process.

To load React 19 with a script tag, we recommend using an ESM-based CDN such as esm.sh.

<script type="module">
  import React from "https://esm.sh/react@19/?dev"
  import ReactDOMClient from "https://esm.sh/react-dom@19/client?dev"
  ...
</script>

Libraries depending on React internals may block upgrades
This release includes changes to React internals that may impact libraries that ignore our pleas to not use internals like SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED. These changes are necessary to land improvements in React 19, and will not break libraries that follow our guidelines.

Based on our Versioning Policy, these updates are not listed as breaking changes, and we are not including docs for how to upgrade them. The recommendation is to remove any code that depends on internals.

To reflect the impact of using internals, we have renamed the SECRET_INTERNALS suffix to:

\_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE

In the future we will more aggressively block accessing internals from React to discourage usage and ensure users are not blocked from upgrading.

TypeScript changes
Removed deprecated TypeScript types
We’ve cleaned up the TypeScript types based on the removed APIs in React 19. Some of the removed have types been moved to more relevant packages, and others are no longer needed to describe React’s behavior.

Nota
We’ve published types-react-codemod to migrate most type related breaking changes:

npx types-react-codemod@latest preset-19 ./path-to-app
If you have a lot of unsound access to element.props, you can run this additional codemod:

npx types-react-codemod@latest react-element-default-any-props ./path-to-your-react-ts-files
Check out types-react-codemod for a list of supported replacements. If you feel a codemod is missing, it can be tracked in the list of missing React 19 codemods.

ref cleanups required
This change is included in the react-19 codemod preset as no-implicit-ref-callback-return .

Due to the introduction of ref cleanup functions, returning anything else from a ref callback will now be rejected by TypeScript. The fix is usually to stop using implicit returns:

- <div ref={current => (instance = current)} />

* <div ref={current => {instance = current}} />
  The original code returned the instance of the HTMLDivElement and TypeScript wouldn’t know if this was supposed to be a cleanup function or not.

useRef requires an argument
This change is included in the react-19 codemod preset as refobject-defaults.

A long-time complaint of how TypeScript and React work has been useRef. We’ve changed the types so that useRef now requires an argument. This significantly simplifies its type signature. It’ll now behave more like createContext.

// @ts-expect-error: Expected 1 argument but saw none
useRef();
// Passes
useRef(undefined);
// @ts-expect-error: Expected 1 argument but saw none
createContext();
// Passes
createContext(undefined);
This now also means that all refs are mutable. You’ll no longer hit the issue where you can’t mutate a ref because you initialised it with null:

const ref = useRef<number>(null);

// Cannot assign to 'current' because it is a read-only property
ref.current = 1;
MutableRef is now deprecated in favor of a single RefObject type which useRef will always return:

interface RefObject<T> {
current: T
}

declare function useRef<T>: RefObject<T>
useRef still has a convenience overload for useRef<T>(null) that automatically returns RefObject<T | null>. To ease migration due to the required argument for useRef, a convenience overload for useRef(undefined) was added that automatically returns RefObject<T | undefined>.

Check out [RFC] Make all refs mutable for prior discussions about this change.

Changes to the ReactElement TypeScript type
This change is included in the react-element-default-any-props codemod.

The props of React elements now default to unknown instead of any if the element is typed as ReactElement. This does not affect you if you pass a type argument to ReactElement:

type Example2 = ReactElement<{ id: string }>["props"];
// ^? { id: string }
But if you relied on the default, you now have to handle unknown:

type Example = ReactElement["props"];
// ^? Before, was 'any', now 'unknown'
You should only need it if you have a lot of legacy code relying on unsound access of element props. Element introspection only exists as an escape hatch, and you should make it explicit that your props access is unsound via an explicit any.

The JSX namespace in TypeScript
This change is included in the react-19 codemod preset as scoped-jsx

A long-time request is to remove the global JSX namespace from our types in favor of React.JSX. This helps prevent pollution of global types which prevents conflicts between different UI libraries that leverage JSX.

You’ll now need to wrap module augmentation of the JSX namespace in `declare module ”…”:

// global.d.ts

- declare module "react" {
  namespace JSX {
  interface IntrinsicElements {
  "my-element": {
  myElementProps: string;
  };
  }
  }
- }
  The exact module specifier depends on the JSX runtime you specified in the compilerOptions of your tsconfig.json:

For "jsx": "react-jsx" it would be react/jsx-runtime.
For "jsx": "react-jsxdev" it would be react/jsx-dev-runtime.
For "jsx": "react" and "jsx": "preserve" it would be react.
Better useReducer typings
useReducer now has improved type inference thanks to @mfp22.

However, this required a breaking change where useReducer doesn’t accept the full reducer type as a type parameter but instead either needs none (and rely on contextual typing) or needs both the state and action type.

The new best practice is not to pass type arguments to useReducer.

- useReducer<React.Reducer<State, Action>>(reducer)

* useReducer(reducer)
  This may not work in edge cases where you can explicitly type the state and action, by passing in the Action in a tuple:

- useReducer<React.Reducer<State, Action>>(reducer)

* useReducer<State, [Action]>(reducer)
  If you define the reducer inline, we encourage to annotate the function parameters instead:

- useReducer<React.Reducer<State, Action>>((state, action) => state)

* useReducer((state: State, action: Action) => state)
  This is also what you’d also have to do if you move the reducer outside of the useReducer call:

const reducer = (state: State, action: Action) => state;
