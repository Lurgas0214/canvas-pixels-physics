import React from 'react';
import './App.css';
import CanvasComponent from './components/CanvasComponent';
import http from './services/fakeHttpService';

class App extends React.Component<{}, { base64String: string | null }> {
  constructor(props: any) {
    super(props);
    this.state = { base64String: null };
  }

  async componentDidMount() {
    const base64String = await http.getFile();
    if (typeof (base64String) === 'string') this.setState({ base64String });
  }

  render() {
    const { base64String } = this.state;

    return (
      <div className="App">
        {base64String && <CanvasComponent base64String={base64String} />}
      </div>
    )
  }
}

export default App;
