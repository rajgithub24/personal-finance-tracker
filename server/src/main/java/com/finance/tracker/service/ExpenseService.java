package com.finance.tracker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finance.tracker.exception.ResourceNotFoundException;
import com.finance.tracker.model.Expense;
import com.finance.tracker.repository.ExpenseRepository;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository repository;

    public Expense addExpense(Expense expense) {
        return repository.save(expense);
    }

    public List<Expense> getExpensesByCategory(String category) {
        return repository.findByCategory(category);
    }

    public List<Expense> getExpensesByDate(String date) {
        return repository.findByDate(date);
    }

    public Expense updateExpense(String id, Expense expense) {
        Expense existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));

        existing.setTitle(expense.getTitle());
        existing.setAmount(expense.getAmount());
        existing.setCategory(expense.getCategory());
        existing.setDate(expense.getDate());

        return repository.save(existing);
    }

    public void deleteExpense(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found with id: " + id);
        }
        repository.deleteById(id);
    }

    public Expense getExpenseById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
    }

    public List<Expense> getAllExpenses() {
        throw new UnsupportedOperationException("Unimplemented method 'getAllExpenses'");
    }
}
