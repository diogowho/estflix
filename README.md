# ESTFlix

## 1. Introdução

No âmbito da unidade curricular de Programação Web, propõe-se o desenvolvimento de uma aplicação web denominada ESTFlix, inspirada em plataformas modernas de streaming de conteúdos multimédia.

O principal objetivo deste projeto é permitir aos alunos aplicar, de forma integrada, conhecimentos fundamentais de desenvolvimento web, incluindo:

- Programação orientada a objetos em JavaScript
- Manipulação do DOM
- Persistência de dados no cliente e servidor
- Desenvolvimento de APIs REST
- Integração com bases de dados relacionais

A aplicação deverá permitir aos utilizadores explorar conteúdos (filmes ou séries), organizados por categorias, bem como interagir com esses conteúdos através de favoritos, histórico e recomendações personalizadas.

Nem toda a aplicação deve ser estilo “Netflix visual”. Há uma distinção importante:

- Interface de consumo (tipo streaming) → cartões, imagens, UI visual
- Interface de gestão (tipo backoffice/admin) → tabelas com CRUD

O projeto será desenvolvido em duas fases:

- **Fase 1**: Aplicação exclusivamente do lado do cliente
- **Fase 2**: Introdução de servidor, base de dados e autenticação

## 2. Fase 1 – Aplicação Cliente (Frontend)

### 2.1. Objetivo

Nesta fase, a aplicação deverá funcionar integralmente no browser, sem recurso a backend. Toda a lógica será implementada em JavaScript, sendo os dados armazenados no localStorage.

Pretende-se que os alunos desenvolvam uma aplicação estruturada, modular e orientada a objetos.

### 2.2. Interface da Aplicação

A interface deverá simular uma plataforma de streaming moderna, com foco na usabilidade e organização visual dos conteúdos.

A aplicação deverá incluir:

- Página principal com conteúdos em destaque
- Listagens de conteúdos organizadas por categorias
- Cartões com imagem, título e classificação
- Navegação clara entre diferentes secções
- Administração das entidades em formato de tabela

### 2.3. Gestão de Conteúdos

Cada conteúdo deverá incluir:

- Identificador (Id)
- Título
- Descrição
- Género
- Ano de lançamento
- Classificação
- Imagem (URL)

Funcionalidades:

- Criar, editar, remover e listar conteúdos
- Filtrar por categoria

Regras:

- Não podem existir conteúdos com o mesmo título
- O Id deve ser gerado automaticamente

### 2.4. Gestão de Categorias

Cada categoria deverá possuir:

- Id
- Nome

Funcionalidades:

- Criar, editar, remover e listar categorias

Regras:

- Nome único
- Não pode apagar categorias com conteúdos associados

### 2.5. Perfis de Utilizador

Cada perfil deverá permitir:

- Favoritos
- Histórico
- Seleção de perfil ativo

### 2.6. Área de Administração

A aplicação deverá incluir tabelas para gestão de dados com operações CRUD.

**Exemplo:**

| Id  | Título    | Género | Ano  | Classificação | Ações         |
| --- | --------- | ------ | ---- | ------------- | ------------- |
| 1   | Inception | Sci-Fi | 2010 | 4.8           | Editar Apagar |
| 2   | Joker     | Drama  | 2019 | 4.5           | Editar Apagar |

### 2.7. Requisitos Técnicos

- Utilização de HTML, CSS e JavaScript (sem recorrer a frameworks como React, Angular, etc)
- Programação orientada a objetos
- Utilização de localStorage para persistência dos dados

### 2.8. Sugestões de Desenvolvimento

Cada grupo tem liberdade para realizar as interfaces com o aspecto gráfica que achar melhor, desde que se mantenham todas as funcionalidades aqui enunciadas.

Os grupos devem tomar as melhores decisões (devidamente fundamentadas) sobre aspetos de implementação que não estejam completamente explícitos no presente enunciado.

Caso se detete alguma inconsistência ou impossibilidade de implementação, poder-se-á reajustar algum dos objetivos do projeto, sendo o mesmo indicado pelo corpo docente atempadamente. Tal situação será excecional e nunca irá prejudicar a avaliação dos alunos.

Comece por criar um web site com três tipos de ficheiros:

- \*.html (páginas HTML)
- styles.css (ficheiro com os estilos a aplicar)
- \*.js (um ou mais ficheiros em JavaScript que implementarãoo as funcionalidades do projeto). São estes os ficheiros que deverão enviar como entrega do projeto (se quiser poderá dividir o JavaScript por diferentes ficheiros para implementar as diversas classes)

Tal como foi descrito, o JavaScript deverá implementar a funcionalidade do projeto (camadas de dados e de negócio), enquanto o HTML+CSS servirão apenas para a apresentação da informação (camada de apresentação).

Não se esqueça que o JavaScript é uma linguagem orientada a objetos. Assim, comece por criar classes, com os respetivos atributos e métodos, para implementar a representação da informação manipulada: tipos de eventos, eventos, membros, etc.

Teste cada uma das classes criadas e respetivos métodos de forma gradual: só passe para o método/classe seguinte quando tiver a certeza que o atual funciona corretamente.

Todas as alterações à informação deverão ser realizadas no JavaScript, atualizando depois o HTML para refletir essas alterações.

Poderá, nos elementos do HTML, utilizar identificadores (atributo id) para apresentar/editar informação (inputs, select, etc.). Com esse identificadores será possível, no JavaScript, aceder aos elementos (através de document.getElementById) para obter a informação introduzida pelo utilizador e atualizar as propriedades dos respetivos objetos.

Pode implementar as páginas já com os elementos na mesmas ou utilizar os métodos do DOM (document.createElement) para criar os elementos necessários à página quando os mesmos não existem, colocando-os, na página, através de appendChild.

**Não é permitido o uso das propriedades, não standard, innerHTML e innerText para criação de conteúdo.**

## 3. Fase 2 – Backend

### 3.1. Objetivo

O objetivo desta fase do projeto é desenvolver a vertente de servidor, criando uma api REST para manipular as entidades existentes no sistema e integrá-la com o que já tinha sido feito no lado do cliente durante a primeira fase.

Esta fase do projeto consiste na alteração do sistema para permitir a gravação da informação numa base de dados e respetiva apresentação, sendo desenvolvido utilizando a tecnologia Node.JS.

### 3.2. API REST

Todas as entidades presentes no sistema deverão ter as suas rotas para realizar as operações de CRUD (Create, Read, Update e Delete), de acordo com o paradigma REST e que recorre aos verbos do protocolo HTTP.

Cada entidade deverá ser descrita na sua API com pelo menos 5 rotas, em que terá 2 GET, 1 POST, 1 PUT e 1 DELETE.

### 3.3. Base de Dados

Todas as operações da API deverão ser devidamente registadas nas respetivas tabelas de uma base de dados relacional em MySQL.

**No manual deverá ser apresentado um diagrama da base de dados, assim como deverá ser fornecido o respetivo script de criação de todas as tabelas e relações entre elas.**

### 3.4. Autenticação

O registo das operações realizadas no website deverá guardar qual o utilizador que realizou uma determinada ação. Para isso é necessário integrar um módulo (como o passport) de gestão de sessões com o módulo express.

A aplicação deverá incluir sistema de autenticação com login e registo.

Cada utilizador deverá:

- Ter conta própria
- Gerir os seus perfis
- Ter dados associados a cada perfil (favoritos, histórico)

### 3.5. Personalização

A aplicação deverá apresentar recomendações simples com base em:

- Histórico de visualização
- Géneros/contéudos preferidos

### 3.6. Integração com Fase 1

A maioria das interfaces do sistema foram realizadas na primeira fase do projeto e nesta segunda fase deverá alterá-las de modo a integrar as referidas interfaces com a API desenvolvida. Para realizar essa integração deverá recorrer a AJAX para realizar as chamadas à API quando necessário.

## Regras

Deverá entregar os seguintes manuais (apenas na fase 2):

- Manual Técnico: O Manual Técnico representa um importante auxílio (principalmente) para os técnicos que não participaram no desenvolvimento do projeto, proporcionando uma descrição técnica das diversas especificidades que suportaram as decisões e o desenvolvimento do software. Um dos principais objetivos deste manual é munir os técnicos que precisarão de conhecer o que foi desenvolvido, a compreender as especificidades técnicas que orientaram a implementação e as decisões tomadas, de forma a que consigam eles próprios prosseguir com o desenvolvimento ou corrigir algum aspeto que tenha ficado menos bem. As secções base de um Manual Técnico são:
    1. Capa – identificação da UC, do projeto e do(s) aluno(s)
    2. Arquitetura do sistema – identificação dos módulos, seus objetivos individuais, suas conexões e como se relacionam – que informação circula dentro de cada módulo e entre módulos
    3. Entidades e sua implementação – poderá recorrer-se à identificação e descrição das várias entidades e da API que as manipula
    4. Descrição das opções tomadas – descrever as opções de implementação que foram tomadas em detrimento de outras, por vezes essas opções podem não ser as mais óbvias e como tal devem ser documentadas
    5. Limitações técnicas e ideias para desenvolvimento futuro – requisitos não implementados – refactoring que se percebe ser necessário fazer no futuro mas que não houve tempo para fazer.
- Manual de Utilizador: O Manual de Utilizador é de mais fácil compreensão do que representa, uma vez que os encontramos em diversos objetos que se compra, seja um electrodoméstico, um carro ou um software. Este manual serve como um guião para proporcionar ao utilizador uma descrição do que fazer em diversas situações. No caso do software o mais comum é descrever todas as Funcionalidades existentes. As secções base de um Manual de Utilizador são: 1. Capa – identificação da UC, do projeto e do(s) aluno(s)
    1. Introdução – Para quem é , para que serve? Que problemas resolve? – Descrever de forma geral os requisitos que o programa satisfaz
    2. Instalação e utilização – Descrever como instalar e configurar o programa, para que este fique pronto a ser usado – Descrever quais os comandos necessários para usar o programa ou scripts a executar (base de dados por exemplo).
    3. Exemplo de utilização – Recorrendo a prints das páginas deverá explicar-se a linha de sucesso, ou seja: o funcionamento típico, e algumas linhas de insucesso, ou seja: possíveis comportamentos de exceção, erros, etc. Se preferir esta secção pode ser demonstrada através de um vídeo.

A classificação do programa terá em conta a qualidade da programação (fatores de qualidade do software), a estrutura do código criado segundo os princípios da programação orientada por objetos, tendo em conta conceitos como a coesão de classes e métodos, o grau de acoplamento entre classes e o desenho de classes orientado pela responsabilidade, e a utilização/conhecimento das linguagens envolvidas.

Serão premiadas a facilidade de utilização, a apresentação, a imaginação e a criatividade.
