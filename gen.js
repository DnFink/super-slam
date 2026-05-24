const fs = require('fs');

function makeLevel(lines) {
    let out = '        [\n';
    for (let i = 0; i < 15; i++) {
        let line = lines[i] || '';
        line = line.padEnd(320, ' ');
        line = line.replace(/ /g, '.');
        out += '            "' + line + '"';
        if (i < 14) out += ',';
        out += '\n';
    }
    out += '        ]';
    return out;
}

const level1 = [];
level1[2] = "                                                     ?K?";
level1[5] = "                                               SSS";
level1[7] = "    C   C    C                                                                           C   C   C                                                                        C   C    C                                                                           C   C   C";
level1[8] = "     C C  C C                            SSS                                              C C C C                                                                          C C  C C                                                                             C C C C";
level1[9] = "      C    C                                                                               C   C                                                                            C    C                                                                               C   C";
level1[11] = "                             ?B?   SSS                        T                                                                     T                                                              ?B?                              T                                                                     T";
level1[12] = "    1    M         S S S                    T        S S S    2                    M                                             SSSt                                          M         S S S                    T        S S S    2                    M                                             SSSt                        g";
level1[13] = "                   SSSSS                    t        SSSSS    t                                                                  SSSt                          SSSSSSS                   SSSSS                    t        SSSSS    t                                                                  SSSt                          SSSSSSS";
level1[14] = "SSSSSSSSSSSSSSSSSSSSSSSSSSSLLSSSSSSSSSSSSSSStSSSSSSSSSSSSSSSSStSSSSSSSSSSSSSSSSSSSSLLSSSSSSSSSSSSSSSSSSSSSSSSSSLLSSSSSSSSSSSSStSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSLLSSSSSSSSSSSSSSStSSSSSSSSSSSSSSSSStSSSSSSSSSSSSSSSSSSSSLLSSSSSSSSSSSSSSSSSSSSSSSSSSLLSSSSSSSSSSSSStSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS";

const level2 = [];
level2[2] = "                                                     ?K?";
level2[3] = "                                       O                               O                                                                                                                                 O                               O";
level2[4] = "                                      SSS                             SSS                                                                                                                               SSS                             SSS";
level2[5] = "       BKB                                     SSS  c                                       c                        O                                                   BKB                                          c                                       c                        O";
level2[6] = "      C   C       c                                SSS                                     SSS                      SSS                                                 C   C       c                                SSS                                     SSS                      SSS";
level2[7] = "      C   C      SSS                                                                                                                                                    C   C      SSS";
level2[8] = "                                         SSS    C C                                                                                                                                                               C C";
level2[9] = "                                                C C                                                                                                                                                               C C";
level2[10] = "               X                                                                                                                                                                 X";
level2[11] = "            S S S                  SSS                   T                                       T                                   T                                        S S S                   5                    T                                       T                                   T";
level2[12] = "    1       S S S               4   S        O           t        S           X            O     t                    C C C C        t                                        S S S               4   S        O           t        S           X            O     t                    C C C C        t                   g";
level2[13] = "    S  WW   SSSSS   WW          WW  S       SSS   WW     t   WW   S    WW   S S S   WW    SSS    t   WW               C C C C        t                  SSS           S  WW   SSSSS   WW          WW  S       SSS   WW     t   WW   S    WW   S S S   WW    SSS    t   WW               C C C C        t                  SSS";
level2[14] = "SSSSSSWWWWSSSSSSSSSWWWWSSSSSSSSTTWWWSWWWWSSSSSSSSWWWWSSSStWWWWWWWWSWWWWWWWWSSSSSSSSTTWWWWWWWWWWWStWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSStSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWSSSSSSSSSWWWWSSSSSSSSTTWWWSWWWWSSSSSSSSWWWWSSSStWWWWWWWWSWWWWWWWWSSSSSSSSTTWWWWWWWWWWWStWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSStSSSSSSSSSSSSSSSSSSSSSSSSSSSS";

const level3 = [];
level3[2] = "                                                     ?K?";
level3[3] = "                                                  C C                                                                                                                                                             C C";
level3[4] = "                                                 C   C                                                                                                                                                           C   C";
level3[5] = "        B?B                                    SSS    C                                                                                                                 B?B                                     C     C";
level3[6] = "       C   C                                                                                                                                                           C   C";
level3[7] = "       C   C                 P             E             P                                                                                                             C   C                 P             E             P";
level3[8] = "                            PPP          SSS            PPP                                                                                                                                 PPP                         PPP";
level3[9] = "                    T      PPPPP                       PPPPP                                                                                                                        T      PPPPP                       PPPPP";
level3[10] = "    1               t     PPPPPPP                     PPPPPPP              C   C                                                                                                    t     PPPPPPP                     PPPPPPP              C   C";
level3[11] = "    S       M       t    PPPPPPPPP SSS               PPPPPPPPP            C     C                                                                                   S       M       t    PPPPPPPPP                   PPPPPPPPP            C     C                        g";
level3[12] = "    S  LL  SSS  LL  t   PPPPPPPPPPP                 PPPPPPPPPPP          C       C                      SSS                                                         S  LL  SSS  LL  t   PPPPPPPPPPP                 PPPPPPPPPPP          C       C                      SSS";
level3[13] = "SSSSSSSLLSSSSSSSLLLLtSSPPPPPPPPPPPPPSSSSSSSSSSSSSSSPPPPPPPPPPPPPSSSSSSSSSLLLLLLLLLSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSLLSSSSSSSLLLLtSSPPPPPPPPPPPPPSSSSSSSSSSSSSSSPPPPPPPPPPPPPSSSSSSSSSLLLLLLLLLSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS";
level3[14] = "SSSSSSSLLSSSSSSSLLLLtSSPPPPPPPPPPPPPSSSSSSSSSSSSSSSPPPPPPPPPPPPPSSSSSSSSSLLLLLLLLLSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSLLSSSSSSSLLLLtSSPPPPPPPPPPPPPSSSSSSSSSSSSSSSPPPPPPPPPPPPPSSSSSSSSSLLLLLLLLLSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS";

let output = 'campaignLevels: {\n';
output += '        1:\n' + makeLevel(level1) + ',\n';
output += '        2:\n' + makeLevel(level2) + ',\n';
output += '        3:\n' + makeLevel(level3) + '\n';
output += '    },';
fs.writeFileSync('levels.txt', output);
