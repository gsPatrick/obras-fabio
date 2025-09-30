// components/landing/Testimonials.js

const testimonials = [
  {
    quote: "O Obra.AI transformou a gestão da nossa construtora. O que antes levava horas de digitação manual, agora é feito em segundos pelo WhatsApp. É simplesmente genial.",
    name: "Carlos Andrade",
    title: "Engenheiro Civil, Construtora Prumo",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg" // Placeholder
  },
  {
    quote: "Finalmente uma ferramenta que entende a correria do canteiro de obras. Meus mestres de obras aderiram na hora, a facilidade de mandar um áudio é o grande diferencial.",
    name: "Juliana Martins",
    title: "Gestora de Projetos, Edifica Engenharia",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg" // Placeholder
  },
  {
    quote: "Ter a visão dos custos em tempo real no dashboard me deu um controle que eu não tinha antes. Consigo tomar decisões mais rápidas e precisas. Recomendo!",
    name: "Ricardo Borges",
    title: "Sócio-Diretor, Borges & Filhos",
    avatar: "https://randomuser.me/api/portraits/men/51.jpg" // Placeholder
  }
]

export function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 lg:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            O que nossos clientes dizem
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Empresas que já estão economizando tempo e dinheiro.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <figure key={index} className="flex flex-col p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-sm">
              <blockquote className="flex-grow text-gray-700 dark:text-gray-300">
                <p className="before:content-['“'] before:text-4xl before:text-blue-500 before:font-serif before:mr-1 after:content-['”'] after:text-4xl after:text-blue-500 after:font-serif after:ml-1">
                  {testimonial.quote}
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <img className="h-12 w-12 rounded-full" src={testimonial.avatar} alt={testimonial.name} />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.title}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}   