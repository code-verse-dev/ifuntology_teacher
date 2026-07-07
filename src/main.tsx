// import "./lib/pdfWorkerSetup";
// import "./index.css";
// import ReactDOM from "react-dom/client";
// import { Provider } from "react-redux";
// import { store } from "./redux/store";
// import App from "./App";

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <Provider store={store}>
//     <App />
//   </Provider>
// );



console.log("1 - main.tsx start");

import "./lib/pdfWorkerSetup";
console.log("2 - pdfWorkerSetup imported");

import "./index.css";
console.log("3 - css imported");

import ReactDOM from "react-dom/client";
console.log("4 - ReactDOM imported");

import { Provider } from "react-redux";
console.log("5 - Provider imported");

import { store } from "./redux/store";
console.log("6 - Store imported");

import App from "./App";
console.log("7 - App imported");

console.log("8 - Before createRoot");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);

console.log("9 - After render");