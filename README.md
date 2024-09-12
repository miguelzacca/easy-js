# Easy JS (em desenvolvimento)

Scripts e css prontos para uso, 
simplificando o desenvolvimento e removendo a nescessidade de criar manualmente a logica em javascript e estilização com css.
- Você só precisara do html no frontend!

## CSS (adição automatica)

O Easy JS usa o matcha css para estilização! para mais informações sobre o projeto:
[https://github.com/lowlighter/matcha](https://github.com/lowlighter/matcha)

## Easy Form

O Easy Form implementa um javascript para form html automaticamente, 
facilitando o frontend basico ao executar as requisiçoes dinamicamente.

### Como iniciar

Simplesmente adicione essa script tag no html:

```html
<script src="https://easy-js.netlify.app/lib/easy-form.js" data-url=""></script>
```

Nesse caso, o atributo `data-url` deve conter a url base da api, exemplo:

```html
<script src="https://easy-js.netlify.app/lib/easy-form.js" data-url="http://localhost:3000"></script>
```

### Como usar os forms

Para `GET` e `POST` você pode pode informar no proprio `<form>` desse modo:

```html
<form method="post">
  <button type="submit">Enviar</button>
</form>
```

Agora para outros metodos como PUT, DELETE e etc... Defina o metodo dessa forma:

```html
<form>
  <input type="hidden" name="_method" value="delete" />
  <button type="submit">Enviar</button>
</form>
```

Para informar o endpoint da api faça dessa forma:

```html
<form>
  <input type="hidden" name="_endpoint" value="/usuario" />
  <button type="submit">Enviar</button>
</form>
```

Para informar parametros faça um input normal porém como o `name="_param"`, vace pode tambem colocar assim: `name="_param{numero}"`:

```html
<form>
  <input type="text" name="_param1" placeholder="Digite seu nome" />
  <input type="text" name="_param2" placeholder="Digite sua idade" />
  // resultado: http://localhost:3000/{nome digitado}/{idade digitada}
  <button type="submit">Enviar</button>
</form>
```

Para query tambem, porem tem que ser `name="_query_{nome da query aqui}"`, exemplo:

```html
<form>
  <input type="text" name="_query_nome" placeholder="Digite seu nome" />
  // resultado: http://localhost:3000?nome={valor digitado no input}
  <button type="submit">Enviar</button>
</form>
```

Para o resto dos input normais, faca igual faria normalmente, 
porem lembre que o `name=""` tem que ter o nome da variavel que voçê deseja receber o backend, exemplo:

```html
<form method="post">
  <input type="number" name="idade" placeholder="Digite sua idade" />
  <button type="submit">Enviar</button>
</form>
```

### Exemplo de form

```html
<form method="post">
  <input type="text" name="nome" placeholder="Digite seu nome" />
  <input type="number" name="idade" placeholder="Digite sua idade" />
  <input type="hidden" name="_endpoint" value="/usuario" />
  <button type="submit">Enviar</button>
</form>
```

### Exemplo completo

```html
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Exemplo</title>
    <script
      src="https://easy-js.netlify.app/lib/easy-form.js"
      data-url="http://localhost:3000"
    ></script>
  </head>

  <body>
    <h2>Criar Cliente</h2>
    <form method="post">
      <input type="text" name="nome" placeholder="Nome" required />
      <input type="number" name="cpf" placeholder="CPF" required />
      <input type="tel" name="telefone" placeholder="Telefone" required />
      <input type="hidden" name="_endpoint" value="/cliente/criar" />
      <button type="submit">Enviar</button>
    </form>

    <br />

    <h2>Pesquisar Cliente</h2>
    <form method="get">
      <input type="number" name="_query_cpf" placeholder="CPF" />
      <input type="hidden" name="_endpoint" value="/cliente/procurar" />
      <button type="submit">Enviar</button>
    </form>
  </body>
</html>
```
