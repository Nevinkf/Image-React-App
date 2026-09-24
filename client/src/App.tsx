// import { useState } from 'react'

import Header from './Header'
import Footer from './Footer'
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <section className = "text-center">
        <Header />
      </section>

      <div className="container">
        <div className="row g-3">
          <div className="col">fdsf</div>
          <div className="col">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Imaging queue</h5>
                <p className="card-text text-body-secondary">14 laptops pending.</p>
                <a href="#" className="btn btn-primary btn-sm">Open</a>
              </div>
            </div>
          </div>
          <div className="col">fdsf</div>
          <div className="col">fdsf</div>
        </div>
      </div>

      <section>
        <Footer/ >
      </section>
    </>
  )

}

export default App
