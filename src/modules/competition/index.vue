<style>
#root {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #0c0316;
  font-family: Montserrat, sans-serif;
  overflow-x: hidden;
  -webkit-user-select: none;
  user-select: none
}

.section-Circuit {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ebebeb
}

.section-Circuit-title {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center
}

.section-Circuit-title h1 {
  color: #009ee1;
  font-size: 3rem;
  text-align: center
}

.section-Circuit h2 {
  font-size: 2.5vw
}

.section-Circuit h3 {
  font-size: 2vw
}

.section-Circuit p {
  font-size: 1vw
}

.section-Circuit-title p {
  width: 60%;
  font-size: 1.8rem;
  text-align: justify;
  margin-top: 20px
}

.section-Circuit span {
  color: #009ee1
}

.section-Circuit-block {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 150px
}

.section-Circuit-block-title {
  width: 85%;
  text-align: end;
  margin: 50px
}

.section-Circuit-block-title h2 {
  color: #009ee1
}

.section-Circuit-block-figure {
  width: 80%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px;
  padding: 50px;
  border-radius: 20px;
  background: #dfb5ff;
  background: linear-gradient(90deg, #dfb5ff03, #dfb5ff26)
}

.section-Circuit-block-figure-text {
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start
}

.section-Circuit-block-figure-image {
  width: 180px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 50px;
  border-radius: 10px;
  background: #5b3c7c;
  background: linear-gradient(-45deg, #5b3c7c, #8942b5 37%)
}

.section-Circuit-block-figure-image img {
  width: 90px
}

.section-Circuit-block-figure-text {
  display: flex
}

.subtitle-circuit {
  font-size: 25px !important;
  margin-bottom: 10px
}

@media (max-width: 1300px) {
  .section-Circuit-block {
    padding: 0
  }
}

@media (max-width:850px) {
  #root .section-Circuit .section-Circuit-block {
    flex-direction: column;
    transform: translate(0) translatey(0);
    padding-left: 0;
    padding-right: 0
  }

  .section-Circuit .section-Circuit-block .section-Circuit-block-title {
    text-align: center;
    margin-bottom: 30px
  }

  .section-Circuit .section-Circuit-block-title h2 {
    font-size: 7vw;
    margin-bottom: 25px
  }

  .section-Circuit .section-Circuit-block h3 {
    font-size: 5vw
  }

  .section-Circuit .section-Circuit-block-figure h2 {
    font-size: 7vw
  }

  .section-Circuit .section-Circuit-block p {
    font-size: 4vw
  }

  .section-Circuit .section-Circuit-block .section-Circuit-block-figure {
    padding: 50px;
    margin: 20px 0;
    align-items: flex-start
  }

  .section-Circuit .section-Circuit-block .section-Circuit-block-figure-image {
    height: 100px
  }

  #root .section-Circuit .section-Circuit-block .section-Circuit-block-figure .section-Circuit-block-figure-image {
    width: 100px !important
  }

  #root .section-Circuit .section-Circuit-block .section-Circuit-block-figure .section-Circuit-block-figure-text {
    width: 80% !important
  }

  #root .section-Circuit .section-Circuit-block .section-Circuit-block-figure .section-Circuit-block-figure-image img {
    width: 70% !important
  }

  .section-Circuit .section-Circuit-title h1 {
    width: 90%
  }

  .section-Circuit .section-Circuit-title p {
    width: 90%;
    font-size: 1.7em;
    font-weight: 300
  }

  .section-Circuit .section-Circuit-title {
    margin-bottom: 50px
  }

  .section-earn .section-earn-block h3 {
    font-size: 2em !important
  }

  .section-Circuit .section-Circuit-title h1 {
    font-size: 2em
  }

  .section-Circuit .section-Circuit-title p {
    font-size: 1.5em
  }
}

@media (max-width:450px) {
  .section-Circuit {
    margin-top: 50px
  }

  .section-Circuit .section-Circuit-block .section-Circuit-block-figure {
    padding: 20px 0;
    transform: translate(0) translatey(0);
    align-items: flex-start
  }

  .section-Circuit .section-Circuit-block .section-Circuit-block-figure br {
    display: none
  }

  #root .section-Circuit .section-Circuit-block .section-Circuit-block-figure .section-Circuit-block-figure-text {
    width: 100% !important
  }

  #root .section-Circuit .section-Circuit-block .section-Circuit-block-figure .section-Circuit-block-figure-image {
    width: 150px !important
  }

  #root .section-Circuit .section-Circuit-block .section-Circuit-block-figure .section-Circuit-block-figure-text p {
    width: 90% !important;
    margin-top: 10px
  }

  .section-Circuit .section-Circuit-block .section-Circuit-block-figure-image {
    margin-right: 15px
  }

  .section-Circuit .section-Circuit-title p {
    width: 80%
  }
}

.section-dates {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  color: #fff;
  margin-top: 100px;
  background-image: url(/assets/kii-global-fondo-radiance-DdMH6-ay.webp);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 30%
}

.section-dates span {
  color: #009ee1
}

.section-dates-up {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 30px 0
}

.section-dates-up h1 {
  width: 80%;
  font-size: 2.5vw;
  text-align: start
}

.section-dates-up p {
  text-align: justify;
  font-size: 1.5vw;
  width: 80%;
  font-weight: 300
}

@media (max-width:850px) {
  .section-dates {
    background-image: none
  }

  .section-dates .section-dates-up h1 {
    font-size: 8vw;
    width: 90%;
    text-align: center
  }

  .section-dates .section-dates-up p {
    font-size: 5vw;
    width: 90%;
    text-align: center
  }
}

@media (max-width:650px) {
  .section-dates .section-dates-up h1 {
    font-size: 6vw;
    width: 90%
  }

  .section-dates .section-dates-up p {
    font-size: 1.5em
  }
}

@media (max-width:450px) {
  .section-dates .section-dates-up p {
    font-size: 1em
  }

  .section-dates .section-dates-up p {
    width: 80%
  }
}

@media (max-width:650px) {
  #root .section-dates {
    transform: translate(0) translatey(0);
    margin-top: 50px
  }

  #root .section-dates .section-dates-up {
    margin-bottom: 0
  }

  #root .section-dates .section-dates-up h1 {
    text-align: center;
    margin-bottom: 20px
  }

  .section-dates {
    background-image: none
  }
}

.section-earn {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 100px;
  color: #ebebeb
}

.section-earn a {
  text-decoration: none;
  color: #009ee1
}

.section-earn li {
  margin-top: 5px;
  list-style: none;
  font-size: 1vw
}

.section-earn h2 {
  font-size: 2.5vw
}

.section-earn h3 {
  font-size: 2vw
}

.section-earn p {
  font-size: 1vw
}

.section-earn span {
  color: #009ee1
}

.section-earn-block {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 150px
}

.section-earn-block-title {
  width: 85%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  margin: 50px
}

.section-earn-block-title h2 {
  color: #009ee1
}

.section-earn-block-title h3 {
  width: 70%;
  font-size: 1.8rem;
  text-align: justify;
  margin-top: 20px
}

.section-earn-block-figure {
  width: 80%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px;
  padding: 50px;
  border-radius: 20px;
  background: #dfb5ff;
  background: linear-gradient(90deg, #dfb5ff03, #dfb5ff26)
}

.section-earn-block-figure-text {
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start
}

.section-earn-block-figure-image {
  width: 180px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 50px;
  border-radius: 10px;
  background: #5b3c7c;
  background: linear-gradient(-45deg, #5b3c7c, #8942b5 37%)
}

.section-earn-block-figure-image img {
  width: 90px
}

.section-earn-block-figure-text {
  display: flex
}

@media (max-width: 1300px) {
  .section-earn-block {
    padding: 0
  }
}

@media (max-width:950px) {
  #root .section-how .section-how-container {
    grid-template-columns: 1fr 1fr;
    padding-top: 50px;
    padding-bottom: 50px
  }

  .section-how .section-how-block h3 {
    font-size: 5vw
  }

  .section-how .section-how-block p {
    font-size: 3vw
  }

  .section-how .section-how-block {
    margin-top: 40px
  }

  #root .section-how h1 {
    font-size: 5vw
  }
}

@media (max-width:850px) {
  #root .section-earn .section-earn-block {
    flex-direction: column;
    transform: translate(0) translatey(0);
    padding-left: 0;
    padding-right: 0
  }

  .section-earn .section-earn-block .section-earn-block-title {
    text-align: center;
    margin-bottom: 30px
  }

  .section-earn .section-earn-block-title h2 {
    font-size: 7vw;
    margin-bottom: 25px
  }

  .section-earn .section-earn-block h3 {
    font-size: 5vw
  }

  .section-earn .section-earn-block-figure h2 {
    font-size: 7vw
  }

  .section-earn .section-earn-block p {
    font-size: 4vw
  }

  .section-earn .section-earn-block .section-earn-block-figure {
    padding: 50px;
    margin: 20px 0;
    align-items: flex-start
  }

  .section-earn .section-earn-block .section-earn-block-figure-image {
    height: 100px
  }

  #root .section-earn .section-earn-block .section-earn-block-figure .section-earn-block-figure-image {
    width: 100px !important
  }

  #root .section-earn .section-earn-block .section-earn-block-figure .section-earn-block-figure-text {
    width: 80% !important
  }

  #root .section-earn .section-earn-block .section-earn-block-figure .section-earn-block-figure-image img {
    width: 70% !important
  }

  .section-earn ul li {
    font-size: 2em
  }
}

@media (max-width:450px) {
  .section-earn {
    margin-top: 50px
  }

  .section-earn .section-earn-block .section-earn-block-figure {
    padding: 20px 0;
    transform: translate(0) translatey(0);
    align-items: flex-start
  }

  .section-earn .section-earn-block .section-earn-block-figure br {
    display: none
  }

  #root .section-earn .section-earn-block .section-earn-block-figure .section-earn-block-figure-text {
    width: 100% !important
  }

  #root .section-earn .section-earn-block .section-earn-block-figure .section-earn-block-figure-image {
    width: 150px !important
  }

  #root .section-earn .section-earn-block .section-earn-block-figure .section-earn-block-figure-text p {
    width: 90% !important;
    margin-top: 10px
  }

  .section-earn .section-earn-block .section-earn-block-figure-image {
    margin-right: 15px
  }

  .section-earn .section-earn-block-title h2 {
    font-size: 2em
  }

  .section-earn .section-earn-block h3 {
    font-size: 1.5em !important
  }

  .section-earn ul li {
    font-size: 1em
  }
}

@media (max-width:650px) {
  .section-earn .section-earn-block-title h3 {
    font-size: 1.5em !important;
    font-weight: 300
  }

  #root .section-earn .section-earn-block-title h3 {
    width: 100% !important
  }
}

.main-final {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 100px 0 50px
}

.main-final h1:nth-child(1) {
  margin-bottom: 20px;
  color: #009ee1
}

.main-final h1:nth-child(2) {
  font-size: 3rem
}

.main-final h1:nth-child(3) {
  font-size: 3rem
}

.main-final h1 {
  width: 80%;
  text-align: center;
  font-size: 4rem;
  color: #fff
}

.flag-final {
  width: 100%;
  display: flex;
  height: auto;
  overflow: hidden
}

.first-box {
  width: 10px;
  height: 10px;
  min-width: 10px;
  min-height: 10px;
  background: #5b3c7c;
  background: linear-gradient(-45deg, #5b3c7c, #8942b5 37%)
}

.second-box {
  width: 10px;
  height: 10px;
  min-width: 10px;
  min-height: 10px
}

.last-flag {
  /* margin-bottom: 200px */
}

@media (max-width: 850px) {
  .main-final h1 {
    font-size: 3.5rem
  }
}

@media (max-width: 650px) {
  .main-final {
    margin: 100px 0 50px
  }

  .last-flag {
    margin-bottom: 150px
  }

  .main-final h1 {
    font-size: 2rem
  }

  .main-final h1:nth-child(1) {
    font-size: 3rem
  }

  .main-final h1:nth-child(2) {
    font-size: 2rem
  }

  .main-final h1:nth-child(3) {
    font-size: 2rem
  }
}

.section-how {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 50px
}

.section-how h1 {
  width: 70%;
  font-size: 4vw;
  color: #fff;
  text-align: center
}

.section-how-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr;
  justify-content: center;
  align-items: center;
  margin-top: 100px
}

.section-how-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center
}

.section-how-block figure {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #5b3c7c;
  background: linear-gradient(-45deg, #5b3c7c, #8942b5 37%)
}

.section-how-block figure img {
  width: 50%
}

.section-how-block-text {
  height: 250px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  text-align: center
}

.section-how-block-text h3 {
  font-size: 2vw;
  color: #009ee1;
  margin: 20px 0
}

.section-how-block-text p {
  width: 70%;
  font-size: 1.1vw;
  font-weight: 300;
  text-align: justify;
  color: #fff;
  margin-top: 30px
}

@media (max-width:850px) {
  .section-how-block figure {
    width: 250px;
    height: 250px
  }

  #root .section-how .section-how-container {
    display: flex;
    flex-direction: column;
    padding-top: 0;
    padding-bottom: 0
  }

  #root .section-how h1 {
    font-size: 8vw;
    width: 100%
  }

  .section-how .section-how-block h3 {
    font-size: 10vw
  }

  .section-how .section-how-block p {
    font-size: 7vw;
    transform: translate(0) translatey(0);
    width: 90%
  }

  .section-how .section-how-block .section-how-block-text {
    transform: translate(0) translatey(0);
    width: 100vw
  }

  .section-how .section-how-block {
    transform: translate(0) translatey(0);
    width: 100vw;
    margin-top: 50px;
    margin-bottom: 50px
  }

  #root .section-how {
    margin-top: 50px;
    margin-bottom: 50px
  }

  .section-how-container {
    padding: 0
  }
}

@media (max-width:850px) {
  #root .section-how .section-how-container {
    margin-top: 100px;
    height: auto !important
  }

  #root .section-how .section-how-container .section-how-block,
  #root .section-how .section-how-container .section-how-block .section-how-block-text {
    height: auto !important
  }

  .section-how .section-how-block p {
    text-align: center;
    width: 80%
  }
}

@media (max-width:650px) {
  .section-how-block-text p {
    font-size: 1.5em !important
  }

  #root .section-how .section-how-container {
    margin-top: 30px
  }

  .section-how-container-2 {
    margin-top: 0 !important
  }

  .section-how-block figure {
    width: 150px;
    height: 150px
  }
}

.main-container-competence {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ebebeb;
  margin: 0 0 100px;
  background: url(/assets/kii-global-fondo-radiance-DdMH6-ay.webp);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain
}

.main-container-competence-section {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center
}

.main-container-competence-section-information {
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center
}

.main-container-competence h1 {
  width: 70%;
  font-size: 3.5vw;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #009ee1
}

.main-container-competence h2 {
  width: 70%;
  font-size: 3vw
}

.main-container-competence h3 {
  width: 60%;
  font-size: 1.8vw;
  margin-bottom: 50px
}

.main-container-competence p {
  width: 60%;
  font-size: 1.5vw;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 300;
  margin: 20px 0;
  text-align: justify
}

@media (max-width: 1200px) {
  .main-container-competence-section {
    margin: 100px 0;
    height: auto;
    background-size: 50%
  }

  .main-container-competence h1,
  .main-container-competence h2,
  .main-container-competence p {
    margin: 10px 0
  }
}

@media (max-width:950px) {
  .main-container-competence {
    margin-bottom: 50px
  }

  #root .main-container-competence-section-information h1 {
    font-size: 6vw
  }

  #root .main-container-competence .main-container-competence-section .main-container-competence-section-information h1 {
    width: 100% !important
  }

  #root .main-container-competence-section-information h2 {
    font-size: 5vw
  }

  #root .main-container-competence .main-container-competence-section .main-container-competence-section-information h2 {
    width: 100% !important
  }

  #root .main-container-competence-section-information p {
    font-size: 3vw
  }

  #root .main-container-competence .main-container-competence-section .main-container-competence-section-information p {
    width: 100% !important
  }

  .main-container-competence h3 {
    font-size: 3vw
  }
}

@media (max-width: 650px) {
  #root .main-container-competence .main-container-competence-section .main-container-competence-section-information h1 {
    width: 100% !important;
    margin: 0;
    font-size: 7vw
  }

  #root .main-container-competence {
    margin-top: 0;
    margin-bottom: 0;
    background: none
  }

  .main-container-competence-section {
    display: flex;
    flex-direction: column;
    position: static;
    background: none
  }

  .main-container-competence figure {
    display: flex;
    justify-content: center;
    align-items: center
  }

  .main-container-competence img {
    width: 100%;
    position: static
  }

  #root .main-container-competence-section-information {
    align-items: center
  }

  #root .main-container-competence-section-information h1 {
    text-align: center;
    font-size: 6vw
  }

  #root .main-container-competence-section-information h2 {
    text-align: center;
    align-items: center;
    justify-content: center;
    font-size: 5vw
  }

  #root .main-container-competence-section-information p {
    text-align: center;
    font-size: 5vw
  }

  #root .main-container-competence .main-container-competence-section .main-container-competence-section-information p,
  #root .main-container-competence .main-container-competence-section .main-container-competence-section-information h2 {
    width: 90% !important
  }
}

@media (max-width:650px) {
  #root .main-container-competence-section-information h2 {
    font-size: 1.8em;
    width: 100%
  }

  #root .main-container-competence-section-information h3 {
    font-size: 1.5em
  }

  #root .main-container-competence .main-container-competence-section .main-container-competence-section-information h3 {
    width: 100% !important
  }

  .main-container-competence-section {
    margin: 0
  }
}

.container-register {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #fff
}

.container-register span {
  color: #009ee1
}

.container-register a {
  text-decoration: none;
  color: #009ee1
}

.container-register h2 {
  font-size: 3vw;
  margin: 70px 0
}

.container-block {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 50px;
  padding: 0 150px
}

.container-register-block-figure {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  background: #dfb5ff;
  background: linear-gradient(0deg, #dfb5ff1a, #fff0);
  border-radius: 20px;
  font-weight: 300
}

.container-register-block-figure-text {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center
}

.container-register-block-figure-text h3 {
  font-size: 1.8vw;
  color: #fff;
  text-align: center;
  margin-top: 50px;
  width: 100%;
  padding-left: 90px;
  z-index: 10
}

.container-register-block-figure-text p {
  width: 80%;
  text-align: justify;
  margin: 80px 0;
  font-size: 1.1vw
}

.container-register-block-figure-number {
  width: 100%;
  display: flex;
  justify-content: center
}

.number {
  width: 80%;
  display: flex;
  justify-content: start;
  font-size: 8vw;
  background: linear-gradient(#009fe3, #00000016);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: 800;
  position: absolute;
  top: 0;
  left: 10px
}

.number-1 {
  width: 80%;
  display: flex;
  justify-content: start;
  font-size: 8vw;
  background: linear-gradient(#a800ff, #00000016);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: 800;
  position: absolute;
  top: 0;
  left: 10px
}

.number-2 {
  width: 80%;
  display: flex;
  justify-content: start;
  font-size: 8vw;
  background: linear-gradient(#6c39f5, #00000016);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: 800;
  position: absolute;
  top: 0;
  left: 10px
}

.number-3 {
  width: 80%;
  display: flex;
  justify-content: start;
  font-size: 8vw;
  background: linear-gradient(#346eec, #00000016);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: 800;
  position: absolute;
  top: 0;
  left: 10px
}

.figure-1 {
  border-radius: 20px;
  border: double 3px transparent;
  background-image: linear-gradient(#0c0316, #0c0316), linear-gradient(180deg, #a800ff, #00000016);
  background-origin: border-box;
  background-clip: content-box, border-box
}

.figure-2 {
  border-radius: 20px;
  border: double 3px transparent;
  background-image: linear-gradient(#0c0316, #0c0316), linear-gradient(180deg, #6c39f5, #00000016);
  background-origin: border-box;
  background-clip: content-box, border-box
}

.figure-3 {
  border-radius: 20px;
  border: double 3px transparent;
  background-image: linear-gradient(#0c0316, #0c0316), linear-gradient(180deg, #346eec, #00000016);
  background-origin: border-box;
  background-clip: content-box, border-box
}

.figure-4 {
  border-radius: 20px;
  border: double 3px transparent;
  background-image: linear-gradient(#0c0316, #0c0316), linear-gradient(180deg, #009fe3, #00000016);
  background-origin: border-box;
  background-clip: content-box, border-box
}

.last-information {
  margin-top: 30px;
  font-size: 1.5vw;
  font-weight: 300;
  width: 70%;
  text-align: center
}

@media (max-width: 1000px) {
  #root .container-register h2 {
    font-size: 5vw
  }

  #root .container-register-block-figure-number p {
    font-size: 20vw
  }

  #root .container-register-block-figure h3 {
    font-size: 6vw;
    margin-top: 20px
  }

  #root .container-register-block-figure-text p {
    font-size: 3vw
  }

  .last-information {
    width: 80%;
    margin-top: 30px;
    font-size: 3vw;
    font-weight: 300;
    text-align: center
  }
}

@media (max-width:650px) {
  #root .container-register h2 {
    font-size: 8vw;
    text-align: center
  }

  #root .container-register-block-figure h3 {
    font-size: 8vw
  }

  #root .container-register-block-figure-text p {
    font-size: 5vw;
    margin: 25px 0
  }

  #root .container-block {
    padding-left: 50px;
    padding-right: 50px
  }

  .last-information {
    margin-top: 30px;
    font-size: 6vw;
    font-weight: 300;
    text-align: center
  }

  #root .container-register-block-figure-number p {
    font-size: 25vw
  }

  .container-register-block-figure-text h3 {
    padding-left: 60px
  }
}

.section-rules {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 100px 0 0
}

.section-rules h1 {
  display: block;
  align-self: center;
  text-align: center;
  width: 50%;
  font-size: 4vw;
  color: #fff;
  margin-bottom: 50px
}

.section-rules span {
  color: #009ee1
}

.section-rules-container,
.section-rules-container img {
  width: 100%
}

.section-rules-block {
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  padding: 0 50px
}

.section-rules-block h2 {
  color: #fff;
  width: 80%;
  font-size: 2.5vw;
  text-align: center;
  margin: 20px 0
}

.section-rules-block p {
  font-size: 1.5vw;
  font-weight: 300;
  color: #fff;
  text-align: center;
  border-top: 5px solid rgb(108, 57, 164);
  border-bottom: 5px solid rgb(108, 57, 164);
  border-radius: 20px;
  padding: 20px 0
}

.calendar-mobile {
  display: none
}

@media (max-width:850px) {
  .calendar-mobile {
    display: block
  }

  .calendar-desktop {
    display: none
  }

  #root .section-rules .section-rules-container {
    display: flex;
    flex-direction: column
  }

  #root .section-rules h1 {
    font-size: 8vw;
    margin-top: 20px;
    margin-bottom: 20px;
    width: 90%
  }

  .span-title {
    margin: 0
  }

  .section-rules .section-rules-block h2 {
    font-size: 7vw
  }

  .section-rules .section-rules-block p {
    font-size: 5vw;
    text-align: center
  }

  .section-rules .section-rules-block {
    padding: 0;
    text-align: justify;
    margin: 30px 0;
    width: 90%;
    height: auto
  }

  #root .section-rules .section-rules-container .section-rules-block h2,
  #root .section-rules .section-rules-container .section-rules-block p {
    width: 100% !important
  }
}

@media (max-width:650px) {
  #root .section-rules .section-rules-container {
    display: flex;
    flex-direction: column
  }

  #root .section-rules h1 {
    font-size: 14vw;
    margin-top: 20px;
    margin-bottom: 20px;
    width: 90%
  }

  .span-title {
    margin: 0
  }

  .section-rules .section-rules-block h2 {
    font-size: 7vw
  }

  .section-rules .section-rules-block p {
    font-size: 6vw;
    text-align: center
  }

  .section-rules .section-rules-block {
    padding: 0;
    text-align: justify;
    margin: 30px 0;
    width: 90%;
    height: auto
  }

  #root .section-rules .section-rules-container .section-rules-block h2,
  #root .section-rules .section-rules-container .section-rules-block p {
    width: 100% !important
  }
}

@media (max-width:450px) {
  #root .section-rules h1 {
    font-size: 2em
  }

  #root .section-rules .section-rules-container .section-rules-block p {
    width: 100% !important
  }

  .section-rules .section-rules-block p {
    font-size: 1.5em
  }

  #root .section-rules .section-rules-container {
    width: 100%
  }
}

@media (max-width:650px) {
  #root .section-rules .section-rules-container .section-rules-block {
    width: 100% !important
  }

  #root .section-rules {
    transform: translate(0) translatey(0)
  }

  #root .section-rules .section-rules-container .section-rules-block p {
    width: 80% !important
  }
}

.section-settings {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #ebebeb;
  position: relative;
  margin: 100px 0
}

.section-settings a {
  text-decoration: none;
  color: #009ee1
}

.section-settings span {
  color: #009ee1;
  font-weight: 800
}

.section-settings-background {
  position: absolute;
  width: 85%;
  height: 81%;
  bottom: 4%;
  border: 3px solid #009ee1;
  border-radius: 20px;
  z-index: -1
}

.section-settings-title {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center
}

.section-settings-title h1 {
  width: 70%;
  font-size: 3.5vw;
  text-align: center;
  margin-bottom: 15px;
  z-index: 1;
  color: #009ee1
}

.section-settings-title p {
  width: 60%;
  font-size: 1.5vw;
  text-align: justify;
  background-color: #0c0316;
  box-shadow: -4px 17px 36px 70px #0c0316
}

.section-settings-information {
  width: 60%;
  font-size: 2.5vw;
  text-align: center;
  margin: 100px 0;
  font-weight: 300;
  z-index: 1
}

.section-settings-information h2 {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #009ee1
}

.section-settings-button-container {
  width: 70%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none
}

.section-settings .section-settings-information p {
  padding-bottom: 50px;
  text-align: justify
}

@media (max-width:850px) {
  #root .section-settings {
    width: 100%;
    margin-top: 80px
  }

  #root .section-settings .section-settings-background {
    min-width: 1px;
    width: 80%;
    height: 700px
  }

  #root .section-settings .section-settings-title {
    font-size: 1vw
  }

  .section-settings .section-settings-title h1 {
    font-size: 6vw;
    z-index: 10
  }

  .section-settings .section-settings-title p {
    font-size: 4vw;
    z-index: 1;
    box-shadow: -4px 17px 34px 20px #0c0316;
    background-color: #0c0316
  }

  .section-settings .section-settings-information p {
    font-size: 5vw;
    z-index: 4
  }

  #root .section-settings .section-settings-information {
    margin-top: 50px;
    margin-bottom: 50px;
    font-size: 16vw;
    width: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10
  }

  #root .section-settings .section-settings-information p {
    width: 80% !important
  }

  .section-settings button {
    height: 60px;
    font-size: 4vw
  }

  #root .section-settings .section-settings-button-container button {
    width: 65% !important;
    box-shadow: -3px -7px 21px 52px #0c0316
  }
}

@media (max-width:750px) {
  #root .section-settings .section-settings-background {
    min-width: 1px;
    width: 80%;
    height: 630px
  }
}

@media (max-width:450px) {
  .section-settings {
    margin-top: 80px
  }

  .section-settings span {
    z-index: 10
  }

  #root .section-settings .section-settings-background {
    height: 380px
  }

  #root .section-settings .section-settings-title {
    font-size: 1vw
  }

  .section-settings button {
    height: 40px;
    font-size: 4vw
  }
}

@media (max-width:850px) {
  #root .section-settings .section-settings-information {
    flex-direction: column
  }

  .section-settings .section-settings-information p {
    font-size: 1.5rem;
    margin-bottom: 30px
  }

  .section-settings .section-settings-information h2 {
    font-size: 2.5rem
  }

  #root .section-settings .section-settings-background {
    height: 600px
  }
}

@media (max-width:450px) {
  #root .section-settings .section-settings-information {
    flex-direction: column
  }

  .section-settings .section-settings-information p {
    font-size: 1rem
  }

  .section-settings .section-settings-information h2 {
    font-size: 2rem
  }

  #root .section-settings .section-settings-background {
    height: 450px
  }

  .section-settings .section-settings-title h1 {
    font-size: 2.5rem;
    width: 100%
  }

  .section-settings {
    margin-top: 100px !important
  }

  .section-settings .section-settings-information p {
    padding-bottom: 0
  }
}

.main-Start {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* margin-top: 100px */
}

.last-flag-start {
  margin-bottom: 50px
}

.flag-Start {
  width: 100%;
  display: flex;
  height: auto;
  overflow: hidden;
  transform: rotate(180deg)
}

.first-box-start {
  width: 10px;
  height: 10px;
  min-width: 10px;
  min-height: 10px;
  background: #5b3c7c;
  background: linear-gradient(-45deg, #5b3c7c, #8942b5 37%)
}

.second-box-start {
  width: 10px;
  height: 10px;
  min-width: 10px;
  min-height: 10px
}

@media (max-width: 850px) {
  .main-Start h1 {
    font-size: 3.5rem
  }
}

@media (max-width: 650px) {
  .main-Start h1 {
    font-size: 2rem
  }
}

.main-stops {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  margin: 150px 0
}

.main-stops span {
  color: #009ee1
}

.main-stops-section {
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center
}

.main-stops-section h1 {
  font-size: 5rem
}

.main-stops-section p {
  font-size: 2rem;
  font-weight: 300;
  text-align: justify;
  margin-top: 50px
}

@media (max-width:850px) {
  .main-stops .main-stops-section h1 {
    font-size: 3em;
    text-align: center
  }

  .main-stops .main-stops-section p {
    font-size: 2.5em
  }
}

@media (max-width:450px) {
  .main-stops .main-stops-section h1 {
    font-size: 2em;
    text-align: center
  }

  .main-stops .main-stops-section p {
    font-size: 1.5em;
    text-align: center
  }

  .main-stops {
    margin: 100px 0
  }
}

.section-table {
  width: 100%;
  height: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-content: center;
  align-items: center;
  margin-top: 100px
}

.section-table-left {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center
}

.section-table-left-up {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 160px;
  margin: 30px 0
}

.section-table-left-up h1 {
  width: 100%;
  font-size: 3.5vw;
  color: #fff
}

.section-table-left-up span {
  color: #009ee1;
  width: 100%
}

.section-table-left-up p {
  width: 100%;
  font-size: 1.45vw;
  color: #fff;
  margin: 20px 0;
  text-align: justify
}

.section-table figure {
  display: flex;
  justify-content: end;
  align-items: center;
  width: 80%;
  height: auto
}

.section-table figure img {
  width: 80%
}

@media (max-width:850px) {
  #root .section-table {
    display: flex;
    flex-direction: column;
    margin-top: 150px
  }

  .section-table .section-table-left .section-table-left-up {
    padding-left: 0;
    padding-right: 0;
    width: 90%
  }

  .section-table figure {
    justify-content: center;
    width: 90%
  }

  .section-table .section-table-left .section-table-left-up {
    text-align: center
  }

  .section-table-left .section-table-left-up h1 {
    font-size: 9vw
  }

  .section-table-left .section-table-left-up p {
    font-size: 5vw;
    text-align: center
  }

  .section-table figure img {
    width: 90%
  }

  .section-table-left .section-table-left-up h1 {
    font-size: 3em
  }
}

@media (max-width:450px) {
  .section-table-left .section-table-left-up h1 {
    font-size: 2em
  }

  #root .section-table {
    margin-top: 100px
  }
}

.main-validator {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  margin: 200px 0 0
}

.main-validator a {
  text-decoration: none;
  color: #009ee1
}

.main-validator-section-title {
  font-size: 3.5rem;
  margin-bottom: 100px;
  text-align: center
}

.main-validator-section {
  width: 80%;
  height: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: center;
  align-items: center;
  gap: 50px
}

.main-validator-section-figure {
  width: 100%;
  height: 40em;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center
}

.main-validator-section-figure h2 {
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
  color: #009ee1
}

.main-validator-section-figure p {
  font-size: 1.3rem;
  font-weight: 300;
  text-align: justify
}

.main-validator-section-figure figure {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 150px;
  clip-path: polygon(50% 0%, 83% 12%, 100% 43%, 94% 78%, 68% 100%, 32% 100%, 6% 78%, 0% 43%, 17% 12%);
  background: #5b3c7c;
  background: linear-gradient(-45deg, #5b3c7c, #8942b5 37%);
  margin-bottom: 50px
}

.main-validator-section-figure img {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  place-items: center;
  align-self: center
}

@media (max-width:850px) {
  #root .main-validator h1 {
    text-align: center;
    font-size: 3em;
    width: 90%
  }

  .main-validator-section-title {
    margin-bottom: 50px
  }

  #root .main-validator .main-validator-section {
    grid-template-columns: 27.44fr
  }

  .main-validator-section .main-validator-section-figure img {
    width: 100px
  }

  .main-validator-section .main-validator-section-figure h2 {
    font-size: 2.5em;
    width: 100%;
    transform: translate(0) translatey(0)
  }

  .main-validator-section .main-validator-section-figure p {
    font-size: 2em;
    text-align: center
  }

  #root .main-validator .main-validator-section .main-validator-section-figure {
    height: auto !important;
    margin: 30px 0
  }
}

@media (max-width:450px) {
  #root .main-validator h1 {
    text-align: center;
    font-size: 2em;
    width: 90%
  }

  #root .main-validator {
    margin-bottom: 150px
  }

  .main-validator-section .main-validator-section-figure h2 {
    font-size: 2em;
    width: 100%;
    transform: translate(0) translatey(0)
  }

  .main-validator-section .main-validator-section-figure p {
    font-size: 1.5em;
    text-align: center
  }
}

@media (max-width:1000px) {
  .main-validator .main-validator-section .main-validator-section-figure {
    height: 800px
  }
}

@media (max-width:900px) {
  .main-validator .main-validator-section .main-validator-section-figure {
    height: 700px
  }
}

@media (max-width: 650px) {
  .main-validator {
    margin: 150px 0 0
  }
}
</style>

<template>
  <div id="root"></div>
</template>
<script>
export default {
  beforeRouteLeave(to, from, next) {
    this.removeScript();
    next();
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.loadScript();
    });
  },
  methods: {
    loadScript() {

      let scriptElement = document.createElement('script')
      scriptElement.setAttribute('src', './competition/index-A8ICZHl2.js')
      scriptElement.async = true;
      document.head.appendChild(scriptElement)
      console.log('here');

    },
    removeScript() {
      const scripts = document.head.getElementsByTagName('script');

      for (let i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src.includes('/competition/index-A8ICZHl2.js')) {
          scripts[i].parentNode.removeChild(scripts[i]);
        }
      }
    },
  },
};
</script>
<route>
    {
      meta: {
        i18n: 'competition',
        order: 3,
        icon: 'material-symbols:trophy',
        section: 2,
        weight: 'font-semibold'
      }
    }
  </route>
