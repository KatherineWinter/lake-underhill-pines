import React from 'react';
import ReactMarkdown from 'react-markdown/with-html'
import { Dropbox } from 'dropbox'
import './App.scss';
import Content from './data/kw_content.json'
import Boxart from './components/boxart'
import Header from './components/header'
import Section from './components/section'
import InformationPane from './components/information-pane'

const getFiles = async () => {
  console.log(
    'process.env.REACT_APP_DROPBOX_ACCESS_TOKEN', process.env.REACT_APP_DROPBOX_ACCESS_TOKEN
  )
  const dropbox = new Dropbox({
    clientId: process.env.REACT_APP_DROPBOX_APP_KEY,
    clientSecret: process.env.REACT_APP_DROPBOX_APP_SECRET,
    accessToken: process.env.REACT_APP_DROPBOX_ACCESS_TOKEN,
    fetch
  })
  console.log('dropbox', dropbox) 
  try {
    const response = await dropbox.filesListFolder({  
      path: ''
    })
    console.log('response', response) 
  } catch(error) {
    console.error(error)
  }
}

function changeSelectedBoxId (boxId) {
  this.setState({ selectedBoxId: boxId })
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedBoxId: null,
      theme: 'lightTheme'
    }
  }

  async componentDidMount(prevProps) {
    getFiles()

    try {
      const result = await fetch(Content.about.markdown)
      this.setState({ article: await result.text() })
    } catch (err) {
      this.setState({ article: err })
    }
  }

  render () {
    const sections = Content.tags.map((tag, tagIndex) => {
      const boxes = Content.boxes.filter(box => box.tags.includes(tag.id))
      const boxart = boxes.map((boxartValue, boxartIndex) =>
        <Boxart key={`boxart_${boxartIndex}`}
          info={boxartValue}
          handleChangeSelectedBoxId={boxId => changeSelectedBoxId.call(this, boxId)}
        />
      )
  
      return (
        <Section
          key={`tag_${tagIndex}`}
          name={tag.name}
          boxart={boxart}
          theme={this.state.theme}
        />
      )
    })

    let boxArtWrapperClass = ''
    let selectedBox = Content.boxes.find(box => box.id === this.state.selectedBoxId)
    if (selectedBox) {
      if (!selectedBox.markdown.includes('.md')) {
        window.open(selectedBox.markdown)
        selectedBox = null
      } else {
        boxArtWrapperClass = 'overlay'
      }
    }
  
    return (
      <div className={`App ${this.state.theme}`}>
        <div className={`boxart-pane ${boxArtWrapperClass}`}>
        <Header
          content={Content.about}/>
          {this.state.article && <div className='info'><ReactMarkdown
              source={this.state.article}
              escapeHtml={false}
            /></div>}
          {sections}
        </div>
        <InformationPane
          selectedBox={selectedBox}
          boxes={Content.boxes}
          handleChangeSelectedBoxId={boxId => changeSelectedBoxId.call(this, boxId)}
        />
      </div>
    );
  }
}
