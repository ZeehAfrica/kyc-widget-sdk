export interface BasicInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
}

export enum LoanApplicationStageEnum {
  EmailVerification = "email_verification",
  PhoneVerification = "phone_verification",
  PersonalInfo = "personal_info",
  LoanRequest = "loan_request",
  Employment = "employment",
  Collateral = "collateral",
  Guarantor = "guarantor",
  Preview = "preview",
  Submitted = "submitted",
}

export enum EmploymentStatusEnum {
  EmployedSalary = "employed_salary",
  // EmployedWage = "employed_wage",
  SelfEmployed = "self_employed",
  BusinessOwner = "business_owner",
  Freelance = "freelance",
  Unemployed = "unemployed",
  Student = "student",
  Other = "other",
}

export enum SectorEnum {
  Government = "government",
  BankingFinance = "banking_finance",
  Telecommunications = "telecommunications",
  OilGas = "oil_gas",
  Manufacturing = "manufacturing",
  RetailTrade = "retail_trade",
  Agriculture = "agriculture",
  Healthcare = "healthcare",
  Education = "education",
  Construction = "construction",
  Technology = "technology",
  Transportation = "transportation",
  Other = "other",
}

export enum PaymentMethodEnum {
  BankTransfer = "bank_transfer",
  Cash = "cash",
  // MobileMoney = "mobile_money",
  // DirectDeposit = "direct_deposit",
  Cheque = "cheque",
  Other = "other",
}


export enum EmploymentPaymentMethodEnum {
  BankTransfer = "bank_transfer",
  Cash = "cash",
  Cheque = "cheque",
  Other = "other",
}

export enum CollateralTypeEnum {
  RealEstate = "real_estate",
  Vehicle = "vehicle",
  Equipment = "equipment",
  Inventory = "inventory",
  Receivables = "receivables",
  CashDeposit = "cash_deposit",
  Other = "other",
}

export enum GuarantorRelationshipEnum {
  Family = "family",
  Friend = "friend",
  Colleague = "colleague",
  BusinessPartner = "business_partner",
  Other = "other",
}

export enum GuarantorEmploymentStatusEnum {
  EmployedSalary = "employed_salary",
  SelfEmployed = "self_employed",
  BusinessOwner = "business_owner",
  Unemployed = "unemployed",
  Retired = "retired",
  Student = "student",
}

export enum LoanPurposeEnum {
  WorkingCapital = "working_capital",
  InventoryPurchase = "inventory_purchase",
  EquipmentPurchase = "equipment_purchase",
  DebtConsolidation = "debt_consolidation",
  Education = "education",
  Medical = "medical",
  HomeImprovement = "home_improvement",
  PersonalUse = "personal_use",
  Agriculture = "agriculture",
  Other = "other",
}
