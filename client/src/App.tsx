import { useState, useEffect } from 'react'

import Header from './Header'
import Footer from './Footer'
import './App.css'

type Image = { id: number; title: string; url: string }

function App() {
  const [image, setImages] = useState<Image[]>([])

  useEffect(() => {
    fetch('/api/images')
      .then((res) => res.json())
      .then(setImages)
      .catch((err) => console.error('Failed to load images', err))
  })

  return (
    <>
      <section className = "text-center">
        <Header />
      </section>

      <div className="container">
        <div className="row g-3">
          {image.map((image, index) => (
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
