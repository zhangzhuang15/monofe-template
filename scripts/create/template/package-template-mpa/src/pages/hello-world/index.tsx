import React, { useState } from "react";

type Prop = {
  appID?: number | string;
};
const App: React.FC<Prop> = (props) => {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(state => ++state);
  };
  return (
    <div>
      <h3>{props.appID || 'appID is lost'}</h3>
      <button onClick={handleClick}>click me</button>
      <form>
        <label>输出：</label>
        <input type="text" value={count} />
      </form>
       
    </div>
  );
};

export default App;