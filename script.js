kataPenting = ['kuis', 'ujian', 'tucil', 'tubes', 'praktikum'];

task = {};

$(document).ready(function(){
    $("#send-btn").on("click", function(){
        $value = $("#data").val();
        $msg = '<div class="user-inbox inbox"><div class="msg-header"><p>'+ $value +'</p></div></div>';
        $(".form").append($msg);
        $("#data").val('');

        let daftarIdDeadline = [];

        if(getKodeMatkul($value) && getTanggal($value) && getTipeTugas($value) && getTopik($value)){
            const currentTaskId = addTask($value);
            showMessage("[TASK BERHASIL DICATAT]");
            
            let tugas = task[currentTaskId];
            tugas = [tugas.tanggal, tugas.kodeMatkul, tugas.tipeTugas, tugas.topik].join(" - ");
            tugas = "(ID: "+currentTaskId+") " + tugas;
            showMessage(tugas);
        }else if(isTugasDiundur($value)){
            const id = getIdTugas($value);
            if(id!=null){
                task[id].tanggal = getTanggal($value);
                showMessage("Tugas berhasil diperbarui");
            }else{
                showMessage("Tugas gagal diperbarui, pastikan id tugas tersedia di daftar deadline");
            }
    
        }else if(isSelesai($value)){
            const id = getIdTugas($value);
            if(id!=null){
                delete task[id];
                showMessage("Tugas berhasil dihapus");
            }else{
                showMessage("Tugas gagal dihapus, pastikan id tugas tersedia di daftar deadline");
            }
        }else if(isTanyaDeadline($value)){
            if(isTanyaMinggu($value)){
                const banyakMinggu = getBanyakDurasi($value);
                for(key of Object.keys(task)){
                    if(isInNweeksLater(task[key].tanggal, banyakMinggu)){
                        let listDeadline = getIdDeadlineByTask($value, task[key], key);
                        for(deadline of listDeadline) daftarIdDeadline.push(deadline);
                    }
                }
                showTugasbyId(daftarIdDeadline);
            }else if(isTanyaHariIni($value)){
                for(key of Object.keys(task)){
                    if(isHariIni(task[key].tanggal)){
                        let listDeadline = getIdDeadlineByTask($value, task[key], key);
                        for(deadline of listDeadline) daftarIdDeadline.push(deadline);
                    }
                }
                showTugasbyId(daftarIdDeadline);
            }else if(isTanyaHari($value)){
                const banyakHari = getBanyakDurasi($value);
                for(key of Object.keys(task)){
                    if(isInNDaysLater(task[key].tanggal, banyakHari)){
                        let listDeadline = getIdDeadlineByTask($value, task[key], key);
                        for(deadline of listDeadline) daftarIdDeadline.push(deadline);
                    }
                }
                showTugasbyId(daftarIdDeadline);
            }else if(isAdaRentang($value)){
                const rentangTanggal = getRentangTanggal($value);
                for(key of Object.keys(task)){
                    if(isInRentangTanggal(task[key].tanggal, rentangTanggal)){
                        let listDeadline = getIdDeadlineByTask($value, task[key], key);
                        for(deadline of listDeadline) daftarIdDeadline.push(deadline);
                    }
                }
                showTugasbyId(daftarIdDeadline);
            }else if(isTanyaSemuaDeadline($value)){
                for(key of Object.keys(task)){
                    daftarIdDeadline.push(key);
                }showTugasbyId(daftarIdDeadline);
            }else if(isAdaKodeMatkul($value)){
                for(key of Object.keys(task)){
                    if(task[key].tipeTugas=="Tubes" || task[key].tipeTugas=="Tucil"){
                        if(task[key].kodeMatkul == getKodeMatkul($value)){
                        daftarIdDeadline.push(key);
                        }
                    }
                }
                showTugasbyId(daftarIdDeadline);
            }
        }else if(isHelp($value)){
            showMessage("[Fitur]");
            showMessage("1. Menambahkan task baru");
            showMessage("2. Melihat daftar task");
            showMessage("3. Melihat deadline task");
            showMessage("4. Memperbarui task");
            showMessage("5. Menghapus finished task");

            showMessage("[Daftar kata penting]");
            showMessage("1. Kuis");
            showMessage("2. Ujian");
            showMessage("3. Tubes");
            showMessage("4. Tucil");
            showMessage("5. Praktikum");

        }else{
            showMessage("Maaf, kata yang anda sebut tidak dikenal");
        }
    });
});

function buildLast(text, pattern){
    let x = {}
    pattern = pattern.toLowerCase();
    text = text.toLowerCase();
    text = new Set(text);
    
    for(word of text){
        x[word] = -1;
    }
    for(let i = 0; i<pattern.length; i++){
        x[pattern[i]] = i;
    }   
    return x
}

function bmMatch(text, pattern){
    const last = buildLast(text, pattern);
    const m = pattern.length;
    const n = text.length;
    let i = m-1;

    if(i>n-1) return -1;

    let j = m-1;
    do {
        if(text[i] == pattern[j]){
            if(j == 0) return i;
            else{
                j--;
                i--;
            }
        }else{
            lo = last[text[i]];
            i = i+m - Math.min(j, 1+lo);
            j = m-1;
        }
    } while (i <= n-1);

    return -1;
}

function mappingTanggal(tanggal){
    if(!tanggal.match(/\d{1,2}\/\d{1,2}\/(\d{4}|\d{2})/)){
        tanggal = tanggal.split(" ");
        let bulan = tanggal[1];

        if(bulan.match(/[j|J]an(uar[i|y])?/)) bulan = '01';
        else if(bulan.match(/[F|f]eb(ruar[i|y])?/)) bulan = '02';
        else if(bulan.match(/[M|m]ar(et|ch)?/)) bulan = '03';
        else if(bulan.match(/[a|A]pr(il)?/)) bulan = '04';
        else if(bulan.match(/[M|m](ei|ay)/)) bulan = '05';
        else if(bulan.match(/[J|j]un(i|y)?/)) bulan = '06';
        else if(bulan.match(/[J|j]ul(i|y)?/)) bulan = '07';
        else if(bulan.match(/[A|a](ug|(u)?gust)(us)?/)) bulan = '08';
        else if(bulan.match(/[S|s]ept(ember)?/)) bulan = '09';
        else if(bulan.match(/[O|o]kt(ober)?/)) bulan = '10';
        else if(bulan.match(/[N|n]ov(ember)?/)) bulan = '11';
        else if(bulan.match(/[D|d]e(s|c)(ember)?/)) bulan = '12';
        else bulan = '';

        const hari = tanggal[0];
        const tahun = tanggal[2];

        tanggal = [hari, bulan, tahun];
    }else{
        tanggal = tanggal.split("/");
        let tahun = tanggal[2];
        if(tahun.length == 2) tahun = "20"+tahun;

        const bulan = tanggal[1];
        const hari = tanggal[0];
        tanggal = [hari, bulan, tahun];
    }
    return tanggal.join("/");
}

function getTanggal(message){
    const patternTanggal = /(\d{1,2}\/\d{1,2}\/(\d{4}|\d{2}))|((\d{1,2})\s([jJ]an(uar[iy])?|[Ff]eb(ruar[iy])?|[Mm]ar(et|ch)?|[aA]pr(il)?|[Mm](ei|ay)|[Jj]un[iy]?|[Jj]ul[iy]?|[Aa](ug|(u)?gust)(us)?|([Ss]ept|[Nn]ov|[Dd]e(s|c))(ember)?|[Oo]kt(ober)?)\s(\d{4}|\d{2}))/;
    let tanggal = message.match(patternTanggal);
    if(tanggal){
        tanggal = mappingTanggal(tanggal[0]);
    }
    return tanggal;
}
function getDay(tanggal){
    tanggal = tanggal.split("/");
    return tanggal[0];
}

function getMonth(tanggal){
    tanggal = tanggal.split("/");
    return tanggal[1];
}

function getYear(tanggal){
    tanggal = tanggal.split("/");
    return tanggal[2];
}
function getKodeMatkul(message){
    let kodeMatkul = message.match(/[A-Z|a-z]{2}\d{4}/);
    if(kodeMatkul){
        kodeMatkul = kodeMatkul[0];
        kodeMatkul = kodeMatkul.slice(0,2).toUpperCase() + kodeMatkul.slice(2);
    }
    return kodeMatkul;
}

function getTopik(message){
    let topik = message.match(/(?<=[A-Z|a-z]{2}\d{4}\s)(.*)(?= pada)/);
    if(topik){
        topik = topik[0];
        topik = topik.split(" ");
        for(let i=0;i<topik.length;i++){
            topik[i] = topik[i].slice(0, 1).toUpperCase() + topik[i].slice(1).toLowerCase();
        }
        topik = topik.join(" ")
    }
    return topik;
}

function getTipeTugas(message){
    message = message.toLowerCase();
    let tipeTugas = null;
    for(word of kataPenting){
        if(message.match(word)) {
            tipeTugas = word.slice(0, 1).toUpperCase() + word.slice(1);
        }
    }
    return tipeTugas;
}

function addTask(message){
    const kodeMatkul = getKodeMatkul(message);
    const tanggal = getTanggal(message);
    const tipeTugas = getTipeTugas(message);
    const topik = getTopik(message);
    const currentTask = {
        tanggal: tanggal,
        kodeMatkul: kodeMatkul,
        tipeTugas: tipeTugas,
        topik: topik
    }
    task[Object.keys(task).length+1] = currentTask;

    return Object.keys(task).length;
}

function isTanyaDeadline(message){
    message = message.toLowerCase();
    if(bmMatch(message, "deadline")!=-1) return true;
    return false;
}

function isTanyaHari(message){
    message = message.toLowerCase();
    if(bmMatch(message, "hari")!=-1) return true;
    return false;
}

function isTanyaHariIni(message){
    message = message.toLowerCase();
    if(bmMatch(message, "hari ini")!=-1) return true;
    return false;
}

function isTanyaMinggu(message){
    message = message.toLowerCase();
    if(bmMatch(message, "minggu")!=-1) return true;
    return false;
}

function getBanyakDurasi(message){
    let durasi = message.match(/\d+/);
    if(durasi) {
        durasi = durasi[0];
    }
    return durasi;
}

function getRentangTanggal(message){
    const patternTanggal = /(\d{1,2}\/\d{1,2}\/(\d{4}|\d{2}))|((\d{1,2})\s([jJ]an(uar[iy])?|[Ff]eb(ruar[iy])?|[Mm]ar(et|ch)?|[aA]pr(il)?|[Mm](ei|ay)|[Jj]un[iy]?|[Jj]ul[iy]?|[Aa](ug|(u)?gust)(us)?|([Ss]ept|[Nn]ov|[Dd]e(s|c))(ember)?|[Oo]kt(ober)?)\s(\d{4}))/g;
    let tanggal = message.match(patternTanggal);
    let rentangTanggal = [];
    if(tanggal){
        for(tgl of tanggal){
            rentangTanggal.push(mappingTanggal(tgl));
        }
    }

    return rentangTanggal;
}
// rentangTanggal = getRentangTanggal(message);
function isInRentangTanggal(tanggal, rentangTanggal){
    let from = rentangTanggal[0];
    let to = rentangTanggal[1];
    let check = getTanggal(tanggal);

    from =  new Date(getYear(from), parseInt(getMonth(from))-1, parseInt(getDay(from)));
    to =  new Date(getYear(to), parseInt(getMonth(to))-1, parseInt(getDay(to)));
    check =  new Date(getYear(check), parseInt(getMonth(check))-1, getDay(check));
    return (check>=from && check<=to);
}

function isInNweeksLater(tanggal, nWeekLater){
    let check = tanggal;
    let from =  new Date();
    let to = new Date(from.getTime() + nWeekLater * 7 * 24 * 60 * 60 * 1000);


    from = from.getDate()+"/"+parseInt(from.getMonth()+1)+"/"+from.getFullYear();
    to = to.getDate()+"/"+parseInt(to.getMonth()+1)+"/"+to.getFullYear();
    rentangTanggal = [from, to];

    return isInRentangTanggal(check, rentangTanggal);
}

function isInNDaysLater(tanggal, nDaysLater){
    let check = tanggal;
    let from =  new Date();
    let to = new Date(from.getTime() + nDaysLater * 24 * 60 * 60 * 1000);


    from = from.getDate()+"/"+parseInt(from.getMonth()+1)+"/"+from.getFullYear();
    to = to.getDate()+"/"+parseInt(to.getMonth()+1)+"/"+to.getFullYear();
    rentangTanggal = [from, to];

    return isInRentangTanggal(check, rentangTanggal);
}

function isHariIni(tanggal){
    let check = getTanggal(tanggal);
    check =  new Date(getYear(check), parseInt(getMonth(check))-1, getDay(check));

    let today = new Date();

    return check.getDate()==today.getDate() && check.getMonth()==today.getMonth() && check.getFullYear()==check.getFullYear();
}

function isAdaRentang(message){
    return getRentangTanggal(message).length==2;
}
function getIdTugas(message){
    let id = message.match(/\d+/);
    if(id) {
        id = id[0];
    }
    return id;
}
function isTanyaSemuaDeadline(message){
    message = message.toLowerCase();
    if(bmMatch(message, "sejauh")!=-1) return true;
    else if(bmMatch(message, "semua")!=-1) return true;
    return false;
}
function isAdaKodeMatkul(message){
    return getKodeMatkul(message)!=null;
}
function isTanyaKuis(message){
    message = message.toLowerCase();
    if(bmMatch(message, "kuis")!=-1) return true;
    return false;
}
function isTanyaUjian(message){
    message = message.toLowerCase();
    if(bmMatch(message, "ujian")!=-1) return true;
    return false;
}
function isTanyaTucil(message){
    message = message.toLowerCase();
    if(bmMatch(message, "tucil")!=-1) return true;
    return false;
}
function isTanyaTubes(message){
    message = message.toLowerCase();
    if(bmMatch(message, "tubes")!=-1) return true;
    return false;
}
function isTanyaPraktikum(message){
    message = message.toLowerCase();
    if(bmMatch(message, "praktikum")!=-1) return true;
    return false;
}
function isTugasDiundur(message){
    message = message.toLowerCase();
    if(bmMatch(message, "diundur")!=-1) return true;
    return false;
}
function getIdDeadlineByTask(message, tugas, id){
    let daftarIdDeadline = [];
    if(isTanyaKuis(message)){
        if(tugas.tipeTugas=="Kuis"){
            daftarIdDeadline.push(id);
        }
    }else if(isTanyaUjian(message)){
        if(tugas.tipeTugas=="Ujian"){
            daftarIdDeadline.push(id);
        }
    }else if(isTanyaTubes(message)){
        if(tugas.tipeTugas=="Tubes"){
            daftarIdDeadline.push(id);
        }
    }else if(isTanyaTucil(message)){
        if(tugas.tipeTugas=="Tucil"){
            daftarIdDeadline.push(id);
        }
    }else if(isTanyaPraktikum(message)){
        if(tugas.tipeTugas=="Praktikum"){
            daftarIdDeadline.push(id);
        }
    }else{
        daftarIdDeadline.push(id);
    }
    return daftarIdDeadline;
}
function isSelesai(message){
    message = message.toLowerCase();
    if(bmMatch(message, "selesai")!=-1) return true;
    else if(bmMatch(message, "menyelesaikan")!=-1) return true;
    return false;
}
function isHelp(message){
    message = message.toLowerCase();
    if(bmMatch(message, "lakukan")!=-1) return true;
    else if(bmMatch(message, "ngapain")!=-1) return true;
    else if(bmMatch(message, "help")!=-1) return true;
    return false; 
}

// TODO
function showTugasbyId(arrayOfId){
    if(arrayOfId.length!=0){
        let messageToShow = '<p>[Daftar Deadline]</p>';
        for(deadline of arrayOfId){
            let tugas = task[deadline];
            tugas = [tugas.tanggal, tugas.kodeMatkul, tugas.tipeTugas, tugas.topik].join(" - ");
            tugas = "(ID: "+deadline+") " + tugas;
            messageToShow += '<p>'+ tugas +'</p>';
        }
        $msg = '<div class="bot-inbox inbox"><div class="msg-header">'+ messageToShow +'</div></div>';
        $(".form").append($msg);
        $("#data").val('');
        
    }else{
        showMessage('Tidak Ada')
    }
}
function showMessage(messageToShow){
    $msg = '<div class="bot-inbox inbox"><div class="msg-header"><p>'+ messageToShow +'</p></div></div>';
    $(".form").append($msg);
    $("#data").val('');
}
