import { useState, useEffect } from 'react'

import Header from './Header'
import Footer from './Footer'
import './App.css'

type Image = { id: number; title: string; url: string }

function App() {
  const [images, setImages] = useState<Image[]>([])

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
          {images.map((image) => (
            <div className="col" key={image.id}>
            <div className="card shadow-sm">
              <div className="card-body">
                <img className="card-img-top" src={image.url} alt={image.title}/>
                <div className="card-body">
                  <p className="card-text text-body-secondary">{image.title}</p>
                </div>
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
