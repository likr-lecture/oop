# オブジェクト指向の基礎(1)：カプセル化

## スタックの実装

スタックはLIFO（Last In First Out）型のデータ構造で、末尾へのデータの追加（push）と末尾からのデータの取出し（pop）の二種類の操作ができます。これをプログラムで実現するためには、データを格納する配列とスタックに格納されている要素数（=次に格納する要素の添え字）を管理する方法が考えられます。プログラムにすると以下のようになります。

```java
void setup() {
  int[] data = new int[100];
  int top = 0;

  int value;

  // push
  data[top] = 10;
  top += 1;

  // push
  data[top] = 20;
  top += 1;

  // pop
  top -= 1;
  value = data[top];
  println(value);

  // push
  data[top] = 30;
  top += 1;

  // pop
  top -= 1;
  value = data[top];
  println(value);

  // pop
  top -= 1;
  value = data[top];
  println(value);
}
```

```console:実行結果
20
30
10
```

スタックの構造を維持するためには、pushとpopの操作で `data` と `top` の2つの変数をセットで扱う必要があることがわかります。これをクラスを用いて一体化してみましょう。「Stack.java」の名前でタブを追加して、以下のようなプログラムになります。

```java:Stack.java
class Stack {
  int[] data = new int[100];
  int top = 0;
}
```

```java
void setup() {
  Stack stack = new Stack();
  int value;

  // push
  stack.data[stack.top] = 10;
  stack.top += 1;

  // push
  stack.data[stack.top] = 20;
  stack.top += 1;

  // pop
  stack.top -= 1;
  value = stack.data[stack.top];
  println(value);

  // push
  stack.data[stack.top] = 30;
  stack.top += 1;

  // pop
  stack.top -= 1;
  value = stack.data[stack.top];
  println(value);

  // pop
  stack.top -= 1;
  value = stack.data[stack.top];
  println(value);
}
```

```console:実行結果
20
30
10
```

`data` と `top` を `Stack` クラスのフィールドにすることでスタックに関する情報をひとまとめにしました。これによって、例えば次のようにStackクラスを利用した関数を作りやすくなるでしょう。

```java
void pushTenTimes(Stack stack, int value) {
  for (int i = 0; i < 10; ++i) {
    stack.data[stack.top] = value;
    stack.top += 1;
  }
}
```

ここまでのプログラムには、次の暗黙の「規約」が存在します。
- pushするときは、`data` の `top` 番目の要素に値を書き込み、`top` の値を1増やす
- popするときは、`top` の値を1減らし、`data` の `top` 番目の要素を取り出す
- スタックはpushとpopの操作のみができる

もしプログラミングの途中でこの規約を忘れてしまった場合は、以下のようにスタックとしての機能を果たさないバグを生じます。

```java
void setup() {
  Stack stack = new Stack();
  int value;

  // push
  stack.data[stack.top] = 10;
  stack.top += 1;

  // push
  stack.data[stack.top] = 20;
  // stack.top += 1; // topを増やすのを忘れた

  // pop
  stack.top -= 1;
  value = stack.data[stack.top];
  println(value);

  // push
  stack.data[stack.top] = 30;
  stack.top += 1;

  // pop
  // stack.top -= 1; // topを減らすのを忘れた
  value = stack.data[stack.top];
  println(value);

  // pop
  stack.top -= 1;
  value = stack.data[stack.top];
  println(value);
}
```

```console:実行結果
10
20
30
```

これを解消するために、pushとpopの操作を関数でまとめます。プログラムは以下のようになります。

```java:Stack.java
class Stack {
  int[] data = new int[100];
  int top = 0;
}
```

```java
void push(Stack stack, int value) {
  stack.data[stack.top] = value;
  stack.top += 1;
}

int pop(Stack stack) {
  stack.top -= 1;
  return stack.data[stack.top];
}

void setup() {
  Stack stack = new Stack();
  int value;

  // push
  push(stack, 10);

  // push
  push(stack, 20);

  // pop
  value = pop(stack);
  println(value);

  // push
  push(stack, 30);

  // pop
  value = pop(stack);
  println(value);

  // pop
  value = pop(stack);
  println(value);
}
```

```console:実行結果
20
30
10
```

これによって、`push` 関数と `pop` 関数を用いる限りはスタックに対する規約を維持することができます。しかしまだ、次のように意図的にスタックの規約を外部から破ることができます。

```java:Stack.java
class Stack {
  int[] data = new int[100];
  int top = 0;
}
```

```java
void push(Stack stack, int value) {
  stack.data[stack.top] = value;
  stack.top += 1;
}

int pop(Stack stack) {
  stack.top -= 1;
  return stack.data[stack.top];
}

void setup() {
  Stack stack = new Stack();
  int value;

  // push
  push(stack, 10);

  // push
  push(stack, 20);

  // スタックの先頭要素を書き換える
  stack.data[0] = 30;

  // pop
  value = pop(stack);
  println(value);

  // pop
  value = pop(stack);
  println(value);
}
```

```console:実行結果
20
30
```

これは、スタックのpushとpopのみができるという規約を破っています。特に大規模なプログラムや複数人での開発では、どこでルールが破られているかわからないことがバグにつながったりします。

スタックに関する規約が常に守られるようにするために、pushとpopの操作を `Stack` クラスのメソッドとして実装し、`data` と `top` を private フィールドにすることで `Stack` クラスの外部からのアクセスを禁止します。プログラムは以下のようになります。

```java:Stack.java
class Stack {
  private int[] data = new int[100];
  private int top = 0;

  void push(int value) {
    this.data[this.top] = value;
    this.top += 1;
  }

  int pop() {
    this.top -= 1;
    return this.data[this.top];
  }
}
```

```java
void setup() {
  Stack stack = new Stack();
  int value;

  // push
  stack.push(10);

  // push
  stack.push(20);

  // pop
  value = stack.pop();
  println(value);

  // push
  stack.push(30);

  // pop
  value = stack.pop();
  println(value);

  // pop
  value = stack.pop();
  println(value);
}
```

```console:実行結果
20
30
10
```

Stack.java の外部から `Stack` クラスの `data` や `top` フィールドにアクセスしようとするとコンパイルエラーになることが確認できます。これによって、スタックの規約を破ることが不可能になります。

## カプセル化

スタックの実装を通した例のように、データと手続きを一体化することでデータが守らないといけない規約を破らせないことを **カプセル化** と呼びます。カプセル化によって、プログラマーが気を付けて守らないといけなかったルール（規約）を、守らなければコンパイルや実行ができないようにして破ることができないように制限します。制約のないプログラミングでは自由度が高い反面、明文化されていないルールを気を付けて守る必要があります。オブジェクト指向のような設計方法の醍醐味は、プログラムにあえて制約を課すことでルールを明文化し、ルールを破ったプログラムを書くことができないようにすることです。

Processing（Java）では、カプセル化を実現するために以下のような文法を使用します。

Processing（Java）でオブジェクト指向プログラミングを行うには、**`class`** キーワードを使用してクラスを定義します。クラスの中には、状態を表す **フィールド**、振る舞いを表す **メソッド**、そして初期化処理を行うための **コンストラクタ** を記述します。

#### フィールド（フィールドの初期化）
クラス内で定義する変数のことを **フィールド** と呼びます。フィールドには宣言と同時に初期値を代入（初期化）することができます。初期化を省略した場合は、数値型なら `0`、boolean型なら `false` などのデフォルト値が自動的に割り当てられます。

```java:Counter.pde
class Counter {
  int count = 10; // フィールドの宣言と初期化
}

void setup() {
  Counter c = new Counter(); // インスタンスの生成
  println(c.count); 
}
```
```console:実行結果
10
```

#### メソッド
クラスが行う処理（振る舞い）を **メソッド** と呼びます。メソッドを呼び出すことで、フィールドの値を読み書きしたり、特定の計算を行わせたりすることができます。

```java:Counter.pde
class Counter {
  int count = 0;

  // メソッドの定義
  void increment() {
    count += 1;
  }
}

void setup() {
  Counter c = new Counter();
  c.increment(); // メソッドの呼び出し
  println(c.count); 
}
```
```console:実行結果
1
```

#### コンストラクタ
インスタンスを `new` キーワードで生成する際に、一度だけ自動的に呼び出される特別なメソッドを **コンストラクタ** と呼びます。コンストラクタは **クラス名と全く同じ名前** にし、**戻り値の型（voidなど）を記述しない** というルールがあります。主にフィールドの初期設定を行うために使用されます。

```java:Counter.pde
class Counter {
  int count;

  // コンストラクタの定義（引数を受け取れる）
  Counter(int initialCount) {
    count = initialCount;
  }
}

void setup() {
  Counter c = new Counter(100); // コンストラクタに値を渡す
  println(c.count); 
}
```
```console:実行結果
100
```

### アクセス修飾子（public, private）
フィールドやメソッドへのアクセスを制限するために、**アクセス修飾子** を使用します。これによって、外部から勝手にデータを書き換えられないように保護することができます。

- **`public`**: クラスの外部から自由にアクセスできます。
- **`private`**: そのクラスの内部からのみアクセス可能です。外部からアクセスしようとするとコンパイルエラーになります。

#### public の例
`public` を指定すると、インスタンスを操作する側から自由にフィールドの値を変更できてしまいます。

```java:Account.pde
class Account {
  public int balance = 1000; // publicフィールド
}

void setup() {
  Account a = new Account();
  a.balance = 5000; // 外部から直接アクセスして書き換え可能
  println(a.balance);
}
```
```console:実行結果
5000
```

#### private の例
`private` を指定すると外部からの直接アクセスが禁止されるため、専用のメソッドを通じてのみデータを操作させることができます。

```java:Account.pde
class Account {
  private int balance = 1000; // privateフィールド

  // 外部から操作するためのpublicメソッド
  public void deposit(int amount) {
    if (amount > 0) {
      this.balance += amount;
    }
  }

  public int getBalance() {
    return this.balance;
  }
}

void setup() {
  Account a = new Account();
  // a.balance = 5000; // エラー：外部からは直接アクセスできない
  
  a.deposit(500);    // メソッド経由で安全に操作する
  println(a.getBalance()); 
}
```
```console:実行結果
1500
```

カプセル化の基本は、フィールドを `private` にして外部から隠し、適切なメソッド（`public`）を通してのみデータを操作できるようにすることです。

ProcessingのIDE（PDE）では、同じタブ（ファイル）の中に複数のクラスを書いた場合、`private` を指定していても同一ファイル内の他のクラスからアクセスできてしまいます。`private` によるアクセス制限を正しく機能させるには、**別のタブ（別のファイル）としてクラスを作成する** 必要があります。本講義の例題でも、クラスは別のタブに作成することを推奨します。
