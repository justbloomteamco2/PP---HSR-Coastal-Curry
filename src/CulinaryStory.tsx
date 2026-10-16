const flavorNotes = [
  ["Prawns", "The dish’s coastal centrepiece."],
  ["Byadagi chilli", "The menu’s warm, red-chilli character."],
  ["Pure ghee", "Roasted together with the masala."],
  ["Tamarind", "A bright, tangy counterpoint."],
];

export default function CulinaryStory() {
  return (
    <section
      aria-labelledby="culinary-story-title"
      className="culinary-story"
      id="coastal-story"
    >
      <figure className="culinary-story__image">
        <img
          alt="Ghee-roasted prawns, an illustrative coastal-cuisine reference"
          decoding="async"
          loading="lazy"
          src="/images/ghee-roasted-prawns.jpg"
        />
        <figcaption>
          Coastal food reference
          <span>Not a photograph of the restaurant’s plating</span>
        </figcaption>
      </figure>

      <div className="culinary-story__copy">
        <h2 id="culinary-story-title">
          Prawn ghee roast,
          <br />
          <em>in four notes.</em>
        </h2>
        <p>
          The menu describes fresh prawns, Byadagi chilli, pure ghee and
          tamarind, roasted into a Mangalorean classic. Here are the ingredients
          it names, without invented sourcing or preparation claims.
        </p>
        <ol className="flavor-notes">
          {flavorNotes.map(([name, description]) => (
            <li key={name}>
              <span>{name}</span>
              <span>{description}</span>
            </li>
          ))}
        </ol>
        <p className="culinary-story__note">
          This is an ingredient-led story, not a 3D recipe or a claim about
          where ingredients are sourced.
        </p>
      </div>
    </section>
  );
}
