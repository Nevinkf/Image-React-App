// import { useState } from 'react'

import Header from './Header'
import Footer from './Footer'
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  const images = ['A', 'B', 'Test 3']; // Will retrieve from database


  return (
    <>
      <section className = "text-center">
        <Header />
      </section>

      <div className="container">
        <div className="row g-3">
          {images.map((image, index) => (
            <div className="col">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="card-img-top" key={index}>{image}</div>
                <p className="card-text text-body-secondary">14 laptops pending.</p>
              </div>
            </div>
          </div>
          ))}
        </div>
      </div>

      <section>
        <Footer/ >
      </section>
    </>
  )

}

export default App
