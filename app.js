
document.addEventListener('DOMContentLoaded', function() {
    
    var move_count = 1;
    var is_game_running = true;
    var chess = new Chess();
    var stockfish = STOCKFISH();
    var depth = 2;
    var player_color = 'w';

    send('uci');

    document.getElementById('move_notation').onkeypress = function (e) {
        if (e.which == 13 && is_game_running && player_color == chess.turn()) {

            var move = this.value;
            this.value = "";

            if (update_game(move)) {
                if (is_game_running) {
                    computer_turn();
                }
            }
        }
    };


    [].forEach.call(document.querySelectorAll('#new_game_button'), function(el) {
        el.addEventListener('click', function() {
            reset();
        })
    });


    [].forEach.call(document.querySelectorAll('#white_button'), function(el) {
        el.addEventListener('click', function() {
            player_color = 'w';
            reset();
        })
    });


    [].forEach.call(document.querySelectorAll('#black_button'), function(el) {
        el.addEventListener('click', function() {
            player_color = 'b';
            reset();
            computer_turn();
        })
    });


    [].forEach.call(document.querySelectorAll('#difficulty_slider'), function(el) {
        el.addEventListener('click', function() {

            document.getElementById('difficulty_value_label').textContent = this.value;

            depth = get_depth_for_difficulty(this.value)

        })
    });


    stockfish.onmessage = function(event) {
        if (String(event).includes('bestmove')) {
            if (String(event).includes('ponder')) {
                move = String(event).split('bestmoveSan ')[1].split(' ponder')[0];
            } else {
                move = String(event).split('bestmoveSan ')[1].split(' baseTurn')[0];
            }
            update_game(move);
        }
    };

    function update_game(move) {
        if (chess.moves().includes(move)) {
            info('');

            document.getElementById('last_move_label').textContent = move;

            if (chess.turn() == 'w') {

                $("#move_table").find('tbody').append('<tr><th scope="row">' + move_count + '</th><td>' + move + '</td><td id="black_move_'+ move_count+ '"></td>');

            } else if (chess.turn() == 'b') {

                document.getElementById('black_move_' + move_count).textContent = move;

                move_count++;
            }

            chess.move(move);

            if (chess.in_checkmate()) {
                info("Checkmate!");
                is_game_running = !is_game_running;
            } else if (chess.in_check()) {
                info("Check!");
                is_game_running = !is_game_running;
            } else if (chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition()) {
                info("Draw!");
                is_game_running = !is_game_running;
            }

            document.getElementById('turn_label').textContent = turnName(chess.turn());

            return true;
        } else {
            info('Invalid move');
            return false;
        }
    }

    function computer_turn() {
        send('position startpos moves ' + get_moves());
        send('go depth ' + depth);
    }

    function send(message) {
        stockfish.postMessage(message);
    }

    function reset() {
        move_count = 1;
        is_game_running = true;
        chess.reset();
        info('');

        var emptEl = document.getElementById('table_body')
        while(emptEl.firstChild) emptEl.removeChild(emptEl.firstChild)

        document.getElementById('last_move_label').textContent = "";
        document.getElementById('turn_label').textContent = turnName(chess.turn())
        
        send('ucinewgame');
    }

    function info(text) {
        document.getElementById('info_label').textContent = text;
    }

    function get_depth_for_difficulty(difficulty) {
        switch (difficulty) {
            case 1:
                return 1;
                break;
            case 2:
                return 2;
                break;
            case 3:
                return 4;
                break;
            case 4:
                return 7;
                break;
            case 6:
                return 9;
                break;
            case 7:
                return 12;
                break;
            case 8:
                return 16;
                break;
            case 9:
                return 20;
                break;
            case 10:
                return 25;
                break;
        }
    }

    function get_moves() {
        var moves = '';
        var history = chess.history({verbose: true});
        
        for(var i = 0; i < history.length; ++i) {
            var move = history[i];
            moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
        }
        
        return moves;
    }

    function turnName(string) {
         if (string == 'b') {
             return "Black";
         } else return "White";
     }
  });