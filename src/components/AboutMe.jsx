import React from 'react';

export default function AboutMe({ aboutData }) {
  const { photoUrl, paragraphs } = aboutData || {};

  // Exact 6 paragraphs as requested
  const defaultParagraphs = [
    "Hi, I'm Nutsa, and it took years to identify myself as an artist.",
    "Having a background in media and management, I've been painting at the same time for more than 10 years.",
    "I used to paint still lifes with flowers, their beautiful shadows, soft lights... and people love that, and I love that aesthetic too. But I guess I gathered enough drama in life to turn it into art.",
    "And it took some courage, too, to paint not for the excitement of other people, but for myself—for self-expression and for enjoyment.",
    "So, my current works are focused on what excites me: contrasts in colors, rainy cityscapes, rusty industrial objects—things that have stories needing to be observed.",
    "Painting became a proof of existence for me, evidence that I didn't waste my time and did something meaningful."
  ];

  const textList = (paragraphs && paragraphs.length > 0) ? paragraphs : defaultParagraphs;

  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-image">
          <div className="img-frame">
            <img src={photoUrl || './image.png'} alt="Nutsa — Artist Portrait" />
          </div>
        </div>

        <div className="about-text">
          {textList.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
