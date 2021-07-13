class Card extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'closed' })
    const nameEl = document.createElement('div')
    nameEl.innerText = this.getAttribute('name')
    shadow.appendChild(nameEl)
  }
}

customElements.define('v-card', Card)
