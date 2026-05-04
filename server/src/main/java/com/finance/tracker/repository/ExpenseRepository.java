package com.finance.tracker.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.finance.tracker.model.Expense;

public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByCategory(String category);
    List<Expense> findByDate(String date);
}
