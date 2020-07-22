1. Atom

   1. Grammar
      1. Grammar Tree
      2. Priority
      3. left-hand side / right-hand side
   2. Runtime
      1. Type Convertion
      2. Reference

2. Expression（优先级高到低）

   1. Member -- 成员运算

      ```g4
      MemberExpression :
      	PrimaryExpression
      	FunctionExpression
      	MemberExpression [ Expression ]
      	MemberExpression . IdentifierName
      	new MemberExpression Arguments
      	
      arguments
       : '(' argumentList? ')'
       ;
      	
      PrimaryExpression :
      	this
      	Identifier
      	Literal
      	ArrayLiteral
      	ObjectLiteral
      	( Expression )
      	
      singleExpression '[' expressionSequence ']'  # MemberIndexExpression
      singleExpression '.' identifierName          # MemberDotExpression
      ```

      

      - `a.b`
      - `a[b]`   相比上一个，这个可以放字符串；当然，作为动态类型语言，`[]`里可以是表达式
      - foo \`string`           真没见过
      - super.b
      - super['b']          这两个是class中用的
      - `new.target`    这是两个关键字
      - `new Foo()`      

   2. New运算符

      1. `new Foo`	

         ```g4
         NewExpression :
         	MemberExpression
         	new NewExpression
         ```

         奇怪的语法，不加括号也行，所以就会出现下面的情况

      ```js
      new a()()		// (new a())()
      new new a()		// new (new a())
      ```

      

   3. `Reference`类型

      a.b取出来的属性不是一个属性值，而是对该属性的[引用](  http://dmitrysoshnikov.com/ecmascript/chapter-3-this/#-reference-type )：

      >  `Reference` type is used for an explanation of such operators as `delete`, `typeof`, `this` and other, and consists of a *base object* and a *property name*. 

      ```js
      // Access foo.
      foo;
       
      // Reference for `foo`.
      const fooReference = {
        base: global,
        propertyName: 'foo',
      };
      ```

      javascript就是使用Reference类型在runtime进行写操作的

   4. Call Expression

      ```g4
      CallExpression :
      	MemberExpression Arguments
      	CallExpression Arguments
      	CallExpression [ Expression ]
      	CallExpression . IdentifierName
      ```

      - `foo()`
      - `super()`
      - `foo()['b']`
      - `foo().b`
      - foo()\`abc \`          嗨，没见过

      ```js
      new a()['b']	// (new a())['b']
      ```

      **可能**是为了处理`new`运算符与`()`运算符结合的问题，才出现这三种`Member、New、Call`表达式，毕竟真是很像

   5. Left Handside

      ```g4
      LeftHandSideExpression :
      	NewExpression
      	CallExpression
      	
      AssignmentExpression :
           ConditionalExpression
           LeftHandSideExpression = AssignmentExpression
           LeftHandSideExpression AssignmentOperator AssignmentExpression
      ```

      left-hand就是看能否放在`=`左边

      所以，`a.b = c`就是合理的；`a + b = c`就是不符合语法的

   6. “Rgiht Handside”

      javascript里面当然没有`Right Handside Expression`这种东西，但是除了`Left Handside Expression`，其他的表达式都可以成为`Right Handside Expression`:

      1. Update Expression

         1. 抱歉，这个我真就没找到 `a++` `a--` `--a` `++a`

      2. Unary Expression

         ```g4
         UnaryExpression :
         	PostfixExpression
         	delete UnaryExpression
         	void UnaryExpression
         	typeof UnaryExpression
         	++ UnaryExpression
         	-- UnaryExpression
         	+ UnaryExpression				# 非数字会有类型转换
         	- UnaryExpression
         	~ UnaryExpression				# 取反
         	! UnaryExpression
         	await singleExpression           ?????????????
         	
         PostfixExpression :
         	LeftHandSideExpression
         	LeftHandSideExpression [no LineTerminator here] ++
         	LeftHandSideExpression [no LineTerminator here] --
         ```

         

      3. Exponental 唯一**右结合**的运算符

         ```g4
          <assoc=right> singleExpression '**' singleExpression                  # PowerExpression
          
          3**2**3
          3**(2**3)
         ```

         

   7. Multiplicative

      ```g4
      MultiplicativeExpression :
      	UnaryExpression
      	MultiplicativeExpression * UnaryExpression
      	MultiplicativeExpression / UnaryExpression
      	MultiplicativeExpression % UnaryExpression
      ```

      这里就能看出**单目运算的优先级是在乘除运算之上**了

   8. Additive

      ```g4
      AdditiveExpression :
      	MultiplicativeExpression
      	AdditiveExpression + MultiplicativeExpression
      	AdditiveExpression - MultiplicativeExpression
      ```

   9. Shift

      ```g4
      ShiftExpression :
      	AddtiveExpression
      	ShiftExpression << AddtiveExpression
      	ShiftExpression >> AddtiveExpression
      	ShiftExpression >>> AddtiveExpression		# 带符号的右移
      ```

   10. Relationship

       ```g4
       RelationalExpression :
            ShiftExpression
            RelationalExpression < ShiftExpression
            RelationalExpression > ShiftExpression
            RelationalExpression <= ShiftExpression
            RelationalExpression >= ShiftExpression
            RelationalExpression instanceof ShiftExpression 
            RelationalExpression in ShiftExpression
       ```

   11. Equality

       ```g4
       EqualityExpression :
            RelationalExpression
            EqualityExpression == RelationalExpression
            EqualityExpression != RelationalExpression
            EqualityExpression === RelationalExpression
            EqualityExpression !== RelationalExpression
       ```

       

   12. Bitwise

       ```g4
       BitwiseANDExpression :
            EqualityExpression
            BitwiseANDExpression & EqualityExpression
            
       BitwiseORExpression :
            BitwiseXORExpression
            BitwiseORExpression | BitwiseXORExpression
       
       BitwiseXORExpression :
            BitwiseANDExpression
            BitwiseXORExpression ^ BitwiseANDExpressions
            
       与 > 异或 > 或
       ```

       

   13. logical

       ```g4
       LogicalORExpression :
            LogicalANDExpression
            LogicalORExpression || LogicalANDExpression
       
       LogicalANDExpression :
            BitwiseORExpression
            LogicalANDExpression && BitwiseORExpression
            
       短路原则
       ```

       

   14. conditional

       ```g4
       ConditionalExpression :
            LogicalORExpression
            LogicalORExpression ? AssignmentExpression : AssignmentExpression
            
       短路原则
       ```

3. Type Convertion

   1. ![](D:\Project\Frontend-02-Template\week02\type convertion.png)
      1. `StringToNumber`
      2. `NumberToString`
      3. `Boxing`
      4. `Unboxing`
   2. 23
   3. 23

4. Statement

5. Block

6. Module





相关链接

1. [Reference类型]( http://dmitrysoshnikov.com/ecmascript/chapter-3-this/#-reference-type )
2. [ES antlr]( https://github.com/antlr/grammars-v4/blob/master/javascript/ecmascript/JavaScript/ECMAScript.g4 )
3. 