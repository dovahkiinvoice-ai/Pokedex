console.log('APP JS CARREGADO')

const limit = 15
let offset = 0
let isLoading = false

const getTypeColor = type => {
  const normal = '#F5F5F5'
  return {
    normal,
    fire: '#FDDFDF',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    ice: '#DEF3FD',
    water: '#DEF3FD',
    ground: '#F4E7DA',
    rock: '#D5D5D4',
    fairy: '#FCEAFF',
    poison: '#98D7A5',
    bug: '#F8D5A3',
    ghost: '#CAC0F7',
    dragon: '#97B3E6',
    psychic: '#EAEDA1',
    fighting: '#E6E0D4'
  }[type] || normal
}

const getPokemonDetails = async url => {
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

const getPokemonsIds = pokeApiResults =>
  pokeApiResults.map(({ url }) => {
    const parts = url.split('/')
    return Number(parts[parts.length - 2])
    console.log('IDS:', ids)
})

const getPokemonsImgs = ids =>
  ids.map(id =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
  )

const getPokemons = async (limit, offset) => {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    )

    if (!response.ok) {
      throw new Error('Não foi possível obter informações')
    }

    const { results } = await response.json()

    const pokemons = []

    for (const pokemon of results) {
      const details = await getPokemonDetails(pokemon.url)
      if (!details) continue

      pokemons.push({
        id: details.id,
        name: details.name,
        types: details.types.map(t => t.type.name),
        imgUrl: details.sprites.front_default
      })
    }

    return pokemons
  } catch (error) {
    console.error('Algo deu errado:', error)
    return []
  }
}

const renderPokemons = pokemons => {
  const ul = document.querySelector('[data-js="pokemon-list"]')

  if (!ul) {
    console.error('Elemento [data-js="pokemon-list"] não encontrado no HTML')
    return
  }

  const fragment = document.createDocumentFragment()

  pokemons.forEach(({ id, name, types, imgUrl }) => {
    const li = document.createElement('li')
    const img = document.createElement('img')
    const nameContainer = document.createElement('h2')
    const typeContainer = document.createElement('p')
    const [firstType] = types

    img.src = imgUrl
    img.alt = name
    img.className = 'card-image'

    li.className = `card ${firstType}`
    li.style.setProperty('--type-color', getTypeColor(firstType))

    nameContainer.textContent =
      `${id}. ${name[0].toUpperCase()}${name.slice(1)}`

    typeContainer.textContent =
      types.length > 1 ? types.join(' | ') : firstType

    li.append(img, nameContainer, typeContainer)
    fragment.append(li)
  })

  ul.append(fragment)

}

const handlePageLoaded = () => {
  loadMorePokemons()
}

const loadMorePokemons = async () => {
  if (isLoading) return

  isLoading = true

  const pokemons = await getPokemons(limit, offset)

  if (pokemons.length) {
    renderPokemons(pokemons)
    offset += limit
  }

  isLoading = false
}



const pokedex = document.querySelector('[data-js="pokemon-list"]')

pokedex.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = pokedex

  if (scrollTop + clientHeight >= scrollHeight - 50) {
    console.log('Carregando mais...')
    loadMorePokemons()
  }
})

handlePageLoaded()
