# Kuwala Canvas [EXPERIMENTAL]

The Kuwala canvas enables you to build complex analytics workflows without needing to write code. You can connect your
data sources, apply transformations on top of them, and finally load them into a model or export them to your favourite
BI tool.

To run the Project, execute the following commands from inside the `kuwala/core/canvas`:

1. Make sure that you have `node` installed on your machine
2. npm ci
3. npm start
4. navigate to `localhost:3000` in your browser

To start the backend, follow the instructions in
[`kuwala/core/backend/README.md`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/core/backend) for now.

To Add an Icon:
1. Modify the `IconLoader.js` file at `src/utils/IconsLoader.js`
2. Import the required icon and also add it into the `library.add()` function call.
3. To use the icon simply call the icon string name, e.g:

```js
    <FontAwesomeIcon
        icon={'clock'}
    />
```