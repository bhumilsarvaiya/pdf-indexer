//********************************
//
// regular expression to validate
// data passed by the user. Only
// lowercase word supported.
//
//********************************
//----- let re = /^[a-z]+$/;

//*******************************
//
// Create a class Trie to
// implement Trie data-structure.
//
//*******************************
module.exports = class Trie {

  //********************************
  //
  // constructor for class Trie
  //
  //********************************
  constructor () {
    this.childNodes = {};
    this.isEnd = false;
    this.tail = false;
  }

  //************************************
  //
  // Class function: insert
  // input: lowercase word
  // returns: no value to return
  //
  //************************************
  insert (word) {

    //********************************************************
    //
    // if current node does not have any child nodes and tail
    // for current node is not set, the remaining part of
    // the word is assign to tail of current node. Else if
    // current node does not have any child but have tail
    // node, tail will be set to false, child nodes will be
    // created. If non of the condition get statisfied, it
    // means the child node upto the parsed word has already
    // been created.
    //
    // e.g.
    // on first insertion of word 'hell', 'he' will be
    // assigned to tail, (isEnd flag will not be set true)
    // root->[tail]->'hell'
    //
    // on next insertion of word 'hel', tail will
    // be assigned false for root node
    //
    // root->[child]->'h'
    //    |->[tail]->'hell'
    //
    //        |
    //        v
    //
    // root->[child]->'h'->[tail]->'ell'
    //    |->[tail]->'hell'
    //
    //        |
    //        v
    //
    // root->[child]->'h'->[tail]->'ell'
    //    |->[tail]->false
    //
    // new word is hel, but root already has child h
    // so, insert function to insert 'el' will be called on
    // root->[child]->'h'. Trace for successive steps are
    //
    // root->[child]->'h'->[tail]->'ell'
    //
    //        |
    //        v
    //
    // root->[child]->'h'->[child]->'e'
    //                  |->[tail]->'ell'
    //        |
    //        v
    //
    // root->[child]->'h'->[child]->'e'->[tail]->'ll'
    //                                |->[isEnd]->false
    //
    // (insert function will be called on
    //  root->[child]->'h'->[child]->'e'
    //  to insert word:'' as word to insert was 'he' and
    //  it has been parsed upto 'he')
    //
    //        |
    //        v
    //
    // root->[child]->'h'-[child]->'e'->[tail]->'ll'
    //                               |->[isEnd]->true
    //
    //********************************************************

    if (!word) {
      this.isEnd = true; //indicates end of parsing word
      return;
    }
    if (Object.keys(this.childNodes).length === 0 && !this.tail) {
      this.tail = word; //current node does not have any child and tail is not set
    } else if (!this.childNodes[word[0]]) {
      if (this.tail) {
        this.childNodes[this.tail[0]] = new Trie();
        this.childNodes[this.tail[0]].insert(this.tail.slice(1));
      }
      this.tail = false; //set tail to false
      if (!this.childNodes[word[0]])
        this.childNodes[word[0]]= new Trie();
      this.childNodes[word[0]].insert(word.slice(1));
    } else {
      this.childNodes[word[0]].insert(word.slice(1));
    }
  }

  //************************************
  //
  // Class function: getStart
  // inputs:
  //     1.prefix to search for
  //     2.prefix matched until now
  // returns:
  //     1.the node where it found match
  //       or false as first argument
  //     2.prefix matched until now as
  //       second argument
  //
  //************************************
  getStart (prefix, matched) {
    if (!prefix)
      return [this, matched];
    if (this.tail && this.tail.indexOf(prefix) === 0) {
      matched = matched.concat(this.tail)
      this.start = this.tail;
      delete this.tail;
      return [this, matched];
    }
    else if (this.childNodes[prefix[0]]) {
      matched = matched.concat(prefix[0])
      return this.childNodes[prefix[0]].getStart(prefix.slice(1), matched);
    } else
      return [false, matched];
  }

  //************************************
  //
  // Class function: hasWord
  // input: word to be searched for
  // returns:
  //     1.true if word found
  //     2.false if word not found
  //
  //************************************
  hasWord (word) {
    if (!word)
      return this.isEnd;
    if (this.tail && this.tail === word)
      return true;
    else if (this.childNodes[word[0]])
      return this.childNodes[word[0]].hasWord(word.slice(1));
    else
      return false;
  }

  //************************************
  //
  // Class function: search
  // input: prefix to search
  // returns: array of words starting
  //          with given prefix
  //
  //************************************
  search (prefix) {

    //**************************************
    //
    // First it will call getStart function
    // to get starting point from where to
    // find words from.
    //
    // Then it will call fetchWords function
    // to get all words possible from that
    // point.
    //
    //**************************************

    let [head, matched] = this.getStart(prefix, '')
    return this.fetchWords(head, prefix, matched)
  }

  //************************************
  //
  // Class function: fetchWords
  // inputs:
  //     1.node from where it starts to
  //       search for words
  //     2.prefix it is searching for
  //     3.any fully matched string from
  //       obtained from getStart function
  // returns: array of all possible words
  //          from given point and prefix
  //
  //************************************
  fetchWords (head, prefix, matched) {
    let result = []
    if (head.isEnd === true && !head.start)
      result.push(prefix);
    if (head.tail)
      result.push(prefix+head.tail);
    for (let i in head.childNodes) {
      let r = this.fetchWords(head.childNodes[i], prefix+i, false);
      result = result.concat(r);
    }
    if (head.start) {
      result.push(matched);
      head.tail = head.start;
      delete head.start;
    }
    return result
  }

  //************************************
  //
  // Class function: validate
  // input: word to validate
  // returns:
  //     1. true if word matches re
  //     2. throw error if validation
  //        fails
  //
  //************************************
  validate (word) {
    // if (word.match(re))
      return;
    // else {
      // throw new Error('validation failed, lowercase alphabets only');
    // }
  }
}
