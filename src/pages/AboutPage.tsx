import { content } from '../lib/content'

export default function AboutPage() {
  return <div className="about-page">
    <header className="about-header">
      <div className="container">
        <p className="kicker light">About the project</p>
        <h1>{content.about.title}</h1>
        <p>{content.about.subtitle}</p>
      </div>
    </header>
    <div className="container about-layout">
      <article className="markdown about-content" dangerouslySetInnerHTML={{ __html: content.about.bodyHtml }} />
    </div>
  </div>
}
