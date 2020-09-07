### 1. 四则运算词法定义
词法定义
- Token
    - Number: <0-9>+
    - Operator: +、-、*、/
- Whitespace: <sp>
- LineTerminator: <LF><CR>
```BNF
<Expression> ::=
    <AdditiveExpression><EOF>

<AdditiveExpression> ::=
    <MultiplicativeExpression>
    |<AdditiveExpression><+><MutiplicativeExpression>
    |<AdditiveExpression><-><MutiplicativeExpression>

<MultiplicativeExpression> ::=
    <Number>
    |<MultiplicativeExpression><*><Number>
    |<MultiplicativeExpression></><Number>
```

### 2. 词法分析
把字符串流变成token
正则表达式进行词法分析
<AdditiveExpression> ::=
    <Number>
    |<MultiplicativeExpression><*><Number>
    |<MultiplicativeExpression></><Number>
    |<AdditiveExpression><+><MutiplicativeExpression>
    |<AdditiveExpression><-><MutiplicativeExpression>

捕获是专门为词法分析准备的语法？？？？


### 3. 语法分析
把token变成抽象语法树AST
LL语法分析

### 4. 解释执行
后序遍历AST，执行