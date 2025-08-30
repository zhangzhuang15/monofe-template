// define your component here.
//
// this is an example, you clear these codes when
// you start to develop.
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}
    >
      <h1 style={{ 
        marginBottom: '30px',
        color: '#333'
      }}
      >react 新页面创建成功！
      </h1>
      
      <div style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      >
        <h3>页面id：{props.appID || 'appID is lost'}</h3>
        <button 
          style={{ 
            border: 'none',
            background: '#1890ff',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }} 
          onClick={handleClick}
        >
          click me
        </button>
        <form>
          <label style={{ marginRight: '10px' }}>输出：</label>
          <input 
            type="text" 
            value={count}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9'
            }}
          />
        </form>
      </div>
    </div>
  );
};

export default App;