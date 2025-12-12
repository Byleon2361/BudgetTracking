#!/bin/bash
# pdf_to_csv_simple_final.sh

input_pdf="$1"
output_csv="${input_pdf%.pdf}.csv"

pdftotext -layout "$input_pdf" /tmp/temp.txt

awk '
BEGIN {
    print "Дата;Сумма;Описание"
}

{
    # Оставляем только строки с датой
    if (!match($0, /^[0-9]{2}\.[0-9]{2}\.[0-9]{4}/)) next
    
    # Извлекаем дату
    match($0, /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})/, d)
    date = d[3] "-" d[2] "-" d[1]
    
    # Удаляем дату из начала
    $0 = substr($0, RLENGTH + 1)
    
    # Ищем суммы (последние 1-2 числа с запятыми)
    # Сначала пробуем найти два числа в конце
    if (match($0, /(.+[^0-9])([-]?[0-9 ]+[.,][0-9]+)[[:space:]]+([-]?[0-9 ]+[.,][0-9]+)[[:space:]]*$/, parts)) {
        amount = parts[2]  # Первая сумма - операция
        description = parts[1]
    }
    # Пробуем найти одно число в конце
    else if (match($0, /(.+[^0-9])([-]?[0-9 ]+[.,][0-9]+)[[:space:]]*$/, parts)) {
        amount = parts[2]
        description = parts[1]
    }
    # Если не нашли
    else {
        amount = "0"
        description = $0
    }
    
    # Очищаем сумму
    gsub(/ /, "", amount)
    gsub(/,/, ".", amount)
    
    # Очищаем описание
    gsub(/[[:space:]]+/, " ", description)
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", description)
    gsub(/;/, ",", description)
    
    # Удаляем лишние пробелы перед точкой
    gsub(/ \./, ".", description)
    
    # Определяем знак по типу операции
    if (description ~ /Супермаркеты|MARIYA|YARCHE|покупка|оплата|QR/) {
        if (amount > 0) amount = "-" amount
    }
    
    print date ";" amount ";" description
}' /tmp/temp.txt > "$output_csv"

echo "Файл создан: $output_csv"
