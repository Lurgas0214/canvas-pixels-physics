import React from 'react';
import logo from './logo.svg';
import './App.css';
import CanvasComponent from './components/CanvasComponent';
import InputFileButton from './components/InputFileButton';

interface IAppStateProps {
  base64String: string | null;
  file: File | null;
}

class App extends React.Component<{}, IAppStateProps> {
  constructor(props: any) {
    super(props);
    this.state = {
      base64String: null,
      file: null
    };
  }

  onChangeEventHandler = (files: FileList | null) => {
    const file = files ? files[0] : undefined;
    const fileReader = new FileReader();

    fileReader.addEventListener("load", () => {
      this.setState({
        file: file as File,
        base64String: fileReader.result as string
      });
    });

    if (file) {
      fileReader.readAsDataURL(file);
    }
  }

  render() {
    const { base64String } = this.state;

    const canvasWrapperStyles: React.CSSProperties = {
      width: '75vw',
      height: '65vh'
    };

    return (
      <div className="App">
        <header className="App-header">
          <div style={canvasWrapperStyles}>
            {base64String ? (
              <CanvasComponent base64String={base64String}></CanvasComponent>
            ) : (
              <img
                alt="logo"
                className="App-logo"
                src={logo}
              />
            )}

          </div>
          <p>Canvas pixels and physics React App.</p>

          <InputFileButton label={'Choose a file'} onChange={this.onChangeEventHandler}></InputFileButton>
        </header>
      </div>
    )
  }
}

export default App;
