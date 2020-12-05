import { useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Link, Route } from 'react-router-dom'
import DOMPurify from 'dompurify';
import * as Ethereum from './services/Ethereum'
import styles from './App.module.css'
import MediumEditor from 'medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/default.css'


const NewArticle = () => {
  const [editor, setEditor] = useState(null)
  const contract = useSelector(({ contract }) => contract)
  useEffect(() => {
    setEditor(new MediumEditor(`.${styles.editable}`))
  }, [setEditor])
  const handleSubmit = () => {
    console.log(editor.getContent())
    if(contract){
      console.log("there is a contract connection")
      contract.methods.addNewArticle(DOMPurify.sanitize(editor.getContent())).send()
      console.log("article was added : content = " + editor.getContent())
    }
  }
  return (
    <div>
      <div>
        <Link to="/">Home</Link>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.subTitle}>New article</div>
        <div className={styles.mediumWrapper}>
          <textarea className={styles.editable}/>
        </div>
        <input type="submit" value="Submit" />
      </form>
    </div>
  )
}

const Home = () => {
  return (
    <div className={styles.links}>
      <Link to="/">Home</Link>
      <Link to="/article/new">Add an article</Link>
      <Link to="/article/all">All articles</Link>
    </div>
  )
}

const AllArticles = () => {
  const [articles, setArticles] = useState([])
  const contract = useSelector(({ contract }) => contract)
  useEffect(() => {
    if (contract) {
      contract.methods.getAllIds().call().then(ids => {
        ids.forEach ( i => {
          contract.methods.articleContent(i).call().then(content => {
            setArticles(articles => [...articles, content])
          })
        })
      })
    }
  }, [contract, setArticles])
  return <div>
      <div className={styles.links}>
        <Link to="/">Home</Link>
      </div>
      <div className={styles.content}>
        <div className={styles.articles}>
          {articles.map((article,index) => { 
            return <div key={index}> article {index} :
                      <Link to={"/article/" + index }> View </Link>
                <div className={styles.article} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(article)}}>
                </div>
            </div>}
          )}
        </div>
      </div>
    </div>
}

const UpdateArticle = (param) => {
  const [editor, setEditor] = useState(null)
  const contract = useSelector(({ contract }) => contract)
  useEffect(() => {
    if(contract){
      contract.methods.articleContent(param.match.params.articleId).call().then(content => {
        const newEditor = new MediumEditor(`.${styles.editable}`)
        newEditor.setContent(content)
        setEditor(newEditor)
      })
    }
  }, [contract, param,setEditor])
  const handleSubmit = () => {
    console.log(editor.getContent())
    if(contract){
      console.log("there is a contract connection")
      contract.methods.updateArticle(param.match.params.articleId, DOMPurify.sanitize(editor.getContent())).send()
      console.log("article was updated : new content = " + editor.getContent())
    }

  }
  return (
    <div>
      <div>
        <Link to="/">Home</Link>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.subTitle}>Update article</div>
        <div className={styles.mediumWrapper}>
          <textarea className={styles.editable}/>
        </div>
        <input type="submit" value="Update" />
      </form>
    </div>
  )
}

const ReadarticleById = (param) =>{
  const contract = useSelector(({ contract }) => contract)
  const [articleContent,setContent] = useState(null)
  useEffect(() => {
    if (contract) {
      contract.methods.getAllIds().call().then(ids => {
        if(ids.includes(param.match.params.articleId)){
          contract.methods.articleContent(param.match.params.articleId).call().then(content => {
            setContent(content)
          })
        }
        else{
          document.getElementById("content").innerHTML =
            "<div>Not found. This page doesn't exist...</div>"
        }

      })
    }
  }, [contract,setContent,param])
  return  <div>
                  <div className={styles.links}>
                    <Link to="/">Home</Link>
                  </div>
                  <div id="content" className={styles.content}>
                  <Link to={"/article/update/" + param.match.params.articleId }>Edit</Link>
                        <div id="article"className={styles.article} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(articleContent)}}/>
                  </div>
          </div>
}

const NotFound = () => {
  return <div>Not found. This page doesn't exist...</div>
}

const App = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(Ethereum.connect)
  }, [dispatch])
  return (
    <div className={styles.app}>
      <div className={styles.title}>Welcome to Decentralized Wikipedia</div>
      <Switch>
        <Route path="/article/new">
          <NewArticle />
        </Route>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/article/all">
          <AllArticles />
        </Route>
        <Route path='/article/update/:articleId' component={UpdateArticle} />
        <Route path='/article/:articleId' component={ReadarticleById} />
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </div>
  )
}

export default App
