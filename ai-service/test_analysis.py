import pytest
from app.utils.text_utils import (
    clean_and_tokenize,
    split_sentences,
    detect_filler_words,
    detect_repetitions,
    calculate_vocabulary_metrics,
)
from app.services.analysis_service import analysis_service

def test_tokenization_and_sentences():
    text = "Hello world! I am testing Speakora's AI pipeline."
    words = clean_and_tokenize(text)
    sentences = split_sentences(text)
    assert len(words) == 8
    assert len(sentences) == 2

def test_filler_word_detection():
    text = "Um I think like actually social media is good, you know."
    count, fillers = detect_filler_words(text)
    assert count >= 3
    words_found = [f["word"] for f in fillers]
    assert "um" in words_found
    assert "like" in words_found

def test_repetition_detection():
    text = "technology technology technology is important"
    words = clean_and_tokenize(text)
    rep_count, repeated = detect_repetitions(words)
    assert rep_count >= 2
    assert repeated[0]["word"] == "technology"

def test_vocabulary_metrics():
    words = ["apple", "banana", "apple", "cherry"]
    metrics = calculate_vocabulary_metrics(words)
    assert metrics["totalWords"] == 4
    assert metrics["uniqueWordCount"] == 3
    assert metrics["vocabularyRichness"] == 0.75

def test_analysis_service_scoring():
    transcript = "Hello, my name is Aldan. I am speaking English to practice my presentation skills and improve my confidence."
    res = analysis_service.analyze_transcript(transcript, duration=60.0)
    assert res["insufficientData"] is False
    assert 0 <= res["scores"]["overall"] <= 100
    assert 0 <= res["scores"]["grammar"] <= 100
    assert 0 <= res["scores"]["vocabulary"] <= 100
    assert 0 <= res["scores"]["fluency"] <= 100
    assert len(res["strengths"]) > 0
