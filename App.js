function teal(message) {
  return "[[gb;#ED177A;]" + message + "]";
}

var App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  box: undefined,
  space: undefined,
  thread: undefined,
  spaceName: "dterm-dev",
  term: null,
  docs: {},
  echo: function(input) {
    App.term.echo(input);
  },
  dir: "/",
  tempstore: "b",
  tempStore: {
    name: "john",
    uncle: "bill",
    age: 29,
    last: "smith",
    full: function() {
      return this.name + " " + this.last;
    }
  },

  init: function() {
    return App.initTerminal();
  },

  // ******************************** //
  //                                  //
  //   Define DTERM functions here    //
  //                                  //
  // ******************************** //
  initTerminal: function() {
    $("body").terminal(
      {
        help: function() {
          App.docs.helpdoc =
            "" +
            "\n" +
            "WELCOME TO THE TERMINAL COMMAND HELP DOC. \n" +
            "" +
            "\nCOMMANDS: \n" +
            "\taccount \t\t\tprint your ethereum account \n" +
            "\techo {string} \t\techos string to terminal \n" +
            "\tls \t\t\t\t\tlist your files \n" +
            "\ttouch {name text} \tsave new file on 3box \n" +
            "\tcat {name} \t\t\tprint file contents \n" +
            "\thelp \t\t\t\tget some info\n" +
            "\n" +
            "3BOX COMMANDS: \n" +
            "\tcreateThread {name} \tcreate private 3box thread" +
            "";

          App.echo(App.docs.helpdoc);
        },
        echo: function(input) {
          this.echo(teal(input));
        },
        account: function() {
          this.echo(App.account);
        },
        save: function(input) {
          App.tempstore = input;
        },
        read: function() {
          this.echo(App.tempstore);
        },
        box: function() {
          App.initBox();
        },

        // 3BOX STORAGE FUNCTIONS
        ls: function() {
          App.space.private.all().then(function(files) {
            App.echo(Object.keys(files).join("  "));
          });
        },
        cat: function(filename) {
          App.space.private.get(filename).then(function(content) {
            App.echo(content);
          });
        },
        touch: function(filename, content) {
          App.space.private.set(filename, content).then(function() {
            App.echo(filename + " saved to private space");
          });
        },

        // 3BOX THREADS
        createThread: function(name) {
          // App.space.thread.create
          App.echo("Creating thread...");
          App.space.createConfidentialThread(name).then(function(thread) {
            App.echo("Thread created.");
            App.thread = thread;
          });
        },
        addThreadMember: function(id) {
          App.echo("Adding member...");
          App.thread.addMember(id).then(function() {
            App.echo("Added " + id);
          });
        },
        joinThread: function(threadAddress) {
          App.echo("Joining thread...");
          App.space.joinThreadByAddress(threadAddress).then(function(thread) {
            App.thread = thread;
            App.echo("Joined thread");
          });
        },
        joinThread2: function() {
          App.echo("Joining thread...");
          App.space
            .joinThreadByAddress(
              "/orbitdb/zdpuAz9a9iUc3Y2PN98C1e2Tx5fFKk8S5gveu81aMGDEfWV5Q/3box.thread.dterm-dev.thread1"
            )
            .then(function(thread) {
              App.thread = thread;
              App.echo("Joined thread");
            });
        },
        getThreadAddress: function() {
          App.echo(App.thread.address);
        },
        threadPosts: function() {
          App.thread.getPosts().then(function(posts) {
            App.echo(posts);
          });
        },
        post: function(message) {
          App.thread.post(message);
        },
        listen: function() {
          App.thread.onUpdate(function() {
            App.thread.getPosts({ limit: 1 }).then(function(post) {
              console.log(post[0].message);
              App.echo(post[0].message);
            });
          });
        },

        // Not for production
        createThread2: function(name) {
          App.space.joinThread(name).then(function(thread) {
            App.thread = thread;
          });
        },
        joinMainThread: function() {
          App.echo("Joining main thread...");
          App.space
            .joinThreadByAddress(
              "/orbitdb/zdpuAtouX4XQHmh4G61mEBouwahK8LsLetLKcsP5FpejYtUcE/3box.thread.dterm-dev.monkey"
            )
            .then(function(thread) {
              App.thread = thread;
            });
        },

        // **  WEB3  ** //
        web3utils: function(option, value) {
          this.echo(web3.utils[option](value));
        },

        bbx: function() {
          this.echo("\n   ****    BBX Password Manager   ****    \n");
          this.echo("Options:");
          this.echo("  e  Encrypt File/Directory");
          this.echo("  d  Decrypt File/Directory");
          this.echo("  p  Generate New Password");
          this.echo("  r  Retrieve Password");
          this.echo("  a  Manage Accounts");
        },

        name: function(name) {
          this.read("last name: ", last_name => {
            this.echo("Your name is " + name + " " + last_name);
          });
        },

        // ENS functions
        ens: function() {},

        // Experimental
        html: function() {
          const link = $('<a href="google.com">Google</a>');
          App.echo(link);
          // this.echo(link);
        },
        download: function(url) {
          const link = $("<a href='" + url + "' download='file'>DOWNLOAD</a>");
          this.echo(link);
        },
        getdoc: function(url) {
          this.pause();
          $.get(url, function(txt) {
            App.echo(txt);
            App.term.resume();
          });
        },

        image: function(width, height) {
          const img = $(
            '<img src="https://placekitten.com/' + width + "/" + height + '">'
          );
          img.on("load", this.resume);
          this.pause();
          this.echo(img);
          const img2 = $(
            "<img src='https://i0.wp.com/media.giphy.com/media/2si2ObWL19ZR9EFVX2/giphy.gif?w=708&ssl=1'>"
          );
          img2.on("load", this.resume);
          this.pause();
          this.echo(img2);
        },

        click_function3: function(func_name, description) {
          // const func_call = "'[[" + func_name + "]]'";
          const func_call = func_name;
          var docline = $("<div class='menu_line'></div>");
          var func_span = $("<span class='clickme'></span>").text(func_call);
          func_span.click(function() {
            App.term.echo(func_call);
            App.term.exec(func_call);
          });
          var whitespace = ".".repeat(15 - func_name.length);
          var whitespace_span = $("<span></span>").text(whitespace);
          var descr_span = $("<span></span>").text(description);
          docline.append(func_span, whitespace_span, descr_span);

          this.echo(docline);
        },
        menu: function() {
          // this.pause();
          $.get("./menu.txt", function(doc) {
            App.term.echo(doc);
            // App.term.resume();
          });
        }
      },
      {
        greetings: teal(welcomeMessage),
        completion: true
      }
    );
    App.term = $("body").terminal();

    return App.initWeb3();
  },

  initWeb3: function() {
    App.echo("Detecting web3...");
    if (typeof web3 !== "undefined") {
      console.log("Using web3 detected from external source like Metamask");
      App.term.echo("Using web3 detected from external source like Metamask");
      App.web3Provider = web3.givenProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      console.log("Using localhost");
      App.term.echo("Using localhost");
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    return App.initEth();
  },

  initEth: function() {
    App.echo("Initializing ethereum account...");
    ethereum.enable().then(function() {
      console.log("Ethereum enabled");
      App.account = window.ethereum.selectedAddress;
      console.log("In initEth: " + App.account);
      App.echo("Detected account: " + App.account);
      
      if (App.account !== "0x0") {
        return App.initBox();
      }
      // return App.initBox();
    });
  },

  initBox: function() {
    App.echo("Opening box...");
    console.log("Opening box...");
    console.log("In initBox: " + App.account);
    Box.openBox(App.account, window.ethereum).then(function(box) {
      box.syncDone.then(function() {
        console.log(box);
        App.box = box;
        App.echo("Box opened!");
        return App.initSpace();
      });
    });
  },

  initSpace: function() {
    console.log("Opening space...");
    App.echo("Opening space...");
    App.box.openSpace(App.spaceName).then(function(space) {
      console.log("Space syncing...");
      App.echo("Space syncing...");
      space.syncDone.then(function() {
        console.log(space);
        // App.echo(space);
        App.echo("Space synced!");
        App.space = space;
        // return App.runOnce();
      });
    });
  }
};

$(function() {
  App.init();
});

const welcomeMessage = "" + 
      "this is dterm\n" + 
      "your portal to the decentralized web";
